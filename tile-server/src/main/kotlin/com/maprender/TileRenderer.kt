package com.maprender

import org.mapsforge.core.graphics.GraphicFactory
import org.mapsforge.core.graphics.TileBitmap
import org.mapsforge.core.model.Tile
import org.mapsforge.map.awt.graphics.AwtGraphicFactory
import org.mapsforge.map.datastore.MapDataStore
import org.mapsforge.map.layer.cache.InMemoryTileCache
import org.mapsforge.map.layer.hills.HillsRenderConfig
import org.mapsforge.map.layer.labels.TileBasedLabelStore
import org.mapsforge.map.layer.renderer.DatabaseRenderer
import org.mapsforge.map.layer.renderer.RendererJob
import org.mapsforge.map.model.DisplayModel
import org.mapsforge.map.reader.MapFile
import org.mapsforge.map.rendertheme.ExternalRenderTheme
import org.mapsforge.map.rendertheme.XmlRenderThemeMenuCallback
import org.mapsforge.map.rendertheme.XmlRenderThemeStyleMenu
import org.mapsforge.map.rendertheme.rule.RenderThemeFuture
import java.awt.image.BufferedImage
import java.io.ByteArrayOutputStream
import java.io.File
import java.io.IOException
import javax.imageio.ImageIO
import kotlin.math.PI
import kotlin.math.ceil
import kotlin.math.cos
import kotlin.math.floor
import kotlin.math.ln
import kotlin.math.pow
import kotlin.math.tan

class TileRenderer(
    mapFilePath: String,
    private val themeManager: ThemeManager,
    hgtDirPath: String? = null,
) {
    private val graphicFactory: GraphicFactory = AwtGraphicFactory.INSTANCE
    private val displayModel = DisplayModel()
    private val mapDataStore: MapDataStore
    private val hillsRenderConfig: HillsRenderConfig?

    // Per-theme renderer and future cache
    private val rendererCache = mutableMapOf<String, DatabaseRenderer>()
    private val themeFutureCache = mutableMapOf<String, RenderThemeFuture>()

    init {
        val mapFile = File(mapFilePath)
        if (!mapFile.exists()) throw IOException("Map file not found: $mapFilePath")
        mapDataStore = MapFile(mapFile)
        println("Map file loaded: $mapFilePath")

        // Hillshading disabled — too slow and visually undesirable
        hillsRenderConfig = null
        /*
        hillsRenderConfig = if (hgtDirPath != null) {
            val hgtDir = File(hgtDirPath)
            if (hgtDir.isDirectory) {
                val tileSource = MemoryCachingHgtReaderTileSource(
                    DemFolderFS(hgtDir),
                    DiffuseLightShadingAlgorithm(),
                    graphicFactory,
                )
                HillsRenderConfig(tileSource).also {
                    it.indexOnThread()
                    println("Hillshading enabled: $hgtDirPath")
                }
            } else {
                System.err.println("HGT_DIR not found or not a directory: $hgtDirPath — hillshading disabled")
                null
            }
        } else {
            null
        }
         */
    }

    /**
     * Evicts the cached renderer and theme future for the given theme,
     * so the next tile request reloads the theme XML from disk.
     */
    @Synchronized
    fun clearThemeCache(themeName: String) {
        rendererCache.remove(themeName)
        themeFutureCache.remove(themeName)
        println("Theme cache cleared for: $themeName")
    }

    /**
     * Returns a DatabaseRenderer for the given theme, creating it on first access.
     */
    @Synchronized
    private fun getRenderer(themeName: String): DatabaseRenderer {
        rendererCache[themeName]?.let { return it }

        println("Loading theme: $themeName")
        val themeFile = themeManager.getThemeFile(themeName)
        if (!themeFile.exists()) throw IOException("Theme file not found: ${themeFile.absolutePath}")

        // Enable all categories that are marked enabled="true" in the stylemenu.
        // Without this callback Mapsforge ignores enabled layers (hiking_routes, contours, etc.).
        val menuCallback =
            object : XmlRenderThemeMenuCallback {
                override fun getCategories(menu: XmlRenderThemeStyleMenu): Set<String> {
                    val active = mutableSetOf<String>()
                    val base = menu.getLayer(menu.defaultValue)
                    if (base != null) {
                        active.addAll(base.categories)
                        for (overlay in base.overlays) {
                            if (overlay.isEnabled) active.addAll(overlay.categories)
                        }
                    }
                    return active
                }
            }
        val renderTheme = ExternalRenderTheme(themeFile, menuCallback)
        val future = RenderThemeFuture(graphicFactory, renderTheme, displayModel)

        // Mapsforge requires running the future in a thread to compile the theme
        Thread(future).also {
            it.start()
            it.join()
        }

        val renderer =
            DatabaseRenderer(
                mapDataStore,
                graphicFactory,
                InMemoryTileCache(0),
                TileBasedLabelStore(1000),
                true, // renderLabels
                true, // cacheLabels
                hillsRenderConfig,
            )

        themeFutureCache[themeName] = future
        rendererCache[themeName] = renderer
        println("Renderer ready for theme: $themeName")
        return renderer
    }

    /**
     * Renders a map area centered on (lat, lng) at the given zoom.
     * Returns a PNG of exactly (width x height) pixels.
     */
    fun renderArea(
        lat: Double,
        lng: Double,
        zoom: Int,
        width: Int,
        height: Int,
    ): ByteArray {
        // Fractional tile coordinates of the center point
        val n = 2.0.pow(zoom)
        val centerTileX = (lng + 180.0) / 360.0 * n
        val latRad = Math.toRadians(lat)
        val centerTileY = (1.0 - ln(tan(latRad) + 1.0 / cos(latRad)) / PI) / 2.0 * n

        // Pixel offset of center within its tile
        val centerPixelX = (centerTileX - floor(centerTileX)) * 256.0
        val centerPixelY = (centerTileY - floor(centerTileY)) * 256.0

        // Tile range needed to cover the output image
        val tileX0 = floor(centerTileX).toInt() - ceil((width / 2.0 - centerPixelX) / 256).toInt()
        val tileY0 = floor(centerTileY).toInt() - ceil((height / 2.0 - centerPixelY) / 256).toInt()
        val tileX1 = floor(centerTileX).toInt() + ceil((width / 2.0 + (256 - centerPixelX)) / 256).toInt()
        val tileY1 = floor(centerTileY).toInt() + ceil((height / 2.0 + (256 - centerPixelY)) / 256).toInt()

        val canvasW = (tileX1 - tileX0 + 1) * 256
        val canvasH = (tileY1 - tileY0 + 1) * 256
        val canvas = BufferedImage(canvasW, canvasH, BufferedImage.TYPE_INT_ARGB)
        val g = canvas.createGraphics()

        for (ty in tileY0..tileY1) {
            for (tx in tileX0..tileX1) {
                val png = renderTile(tx, ty, zoom.toByte()) ?: continue
                val img = ImageIO.read(png.inputStream())
                g.drawImage(img, (tx - tileX0) * 256, (ty - tileY0) * 256, null)
            }
        }
        g.dispose()

        // Crop to exactly (width x height) centered on lat/lng
        val centerCanvasX = ((centerTileX - tileX0) * 256).toInt()
        val centerCanvasY = ((centerTileY - tileY0) * 256).toInt()
        val cropX = (centerCanvasX - width / 2).coerceIn(0, canvasW - width)
        val cropY = (centerCanvasY - height / 2).coerceIn(0, canvasH - height)
        val cropped = canvas.getSubimage(cropX, cropY, width, height)

        return ByteArrayOutputStream().also { ImageIO.write(cropped, "png", it) }.toByteArray()
    }

    /**
     * Renders tile (x, y, zoom) with the currently selected theme.
     * Returns PNG bytes, or null when the tile has no map data.
     */
    fun renderTile(
        x: Int,
        y: Int,
        zoom: Byte,
    ): ByteArray? {
        val themeName =
            themeManager.currentTheme
                ?: throw IllegalStateException("No theme selected")

        val renderer = getRenderer(themeName)
        val future = themeFutureCache[themeName]!!

        val tile = Tile(x, y, zoom, 256)
        val job = RendererJob(tile, mapDataStore, future, displayModel, 1.0f, false, false)

        val tileBitmap: TileBitmap? =
            synchronized(renderer) {
                renderer.executeJob(job)
            }

        tileBitmap ?: return null

        return try {
            val image = AwtGraphicFactory.getBitmap(tileBitmap)
            ByteArrayOutputStream().also { ImageIO.write(image, "png", it) }.toByteArray()
        } finally {
            tileBitmap.decrementRefCount()
        }
    }
}
