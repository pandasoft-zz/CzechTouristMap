package com.maprender

import org.mapsforge.core.graphics.GraphicFactory
import org.mapsforge.core.graphics.TileBitmap
import org.mapsforge.core.model.Tile
import org.mapsforge.map.awt.graphics.AwtGraphicFactory
import org.mapsforge.map.datastore.MapDataStore
import org.mapsforge.map.layer.cache.InMemoryTileCache
import org.mapsforge.map.layer.labels.TileBasedLabelStore
import org.mapsforge.map.layer.renderer.DatabaseRenderer
import org.mapsforge.map.layer.renderer.RendererJob
import org.mapsforge.map.model.DisplayModel
import org.mapsforge.map.reader.MapFile
import org.mapsforge.map.rendertheme.ExternalRenderTheme
import org.mapsforge.map.rendertheme.rule.RenderThemeFuture
import java.io.ByteArrayOutputStream
import java.io.File
import java.io.IOException
import javax.imageio.ImageIO

class TileRenderer(mapFilePath: String, private val themeManager: ThemeManager) {

    private val graphicFactory: GraphicFactory = AwtGraphicFactory.INSTANCE
    private val displayModel = DisplayModel()
    private val mapDataStore: MapDataStore

    // Per-theme renderer and future cache
    private val rendererCache = mutableMapOf<String, DatabaseRenderer>()
    private val themeFutureCache = mutableMapOf<String, RenderThemeFuture>()

    init {
        val mapFile = File(mapFilePath)
        if (!mapFile.exists()) throw IOException("Map file not found: $mapFilePath")
        mapDataStore = MapFile(mapFile)
        println("Map file loaded: $mapFilePath")
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

        val renderTheme = ExternalRenderTheme(themeFile)
        val future = RenderThemeFuture(graphicFactory, renderTheme, displayModel)

        // Mapsforge requires running the future in a thread to compile the theme
        Thread(future).also { it.start(); it.join() }

        val renderer = DatabaseRenderer(
            mapDataStore, graphicFactory,
            InMemoryTileCache(0),
            TileBasedLabelStore(1000), // LabelStore pro text / popisky
            true,  // renderLabels
            true,  // cacheLabels
            null   // HillsRenderConfig – stínování kopců nepotřebujeme
        )

        themeFutureCache[themeName] = future
        rendererCache[themeName] = renderer
        println("Renderer ready for theme: $themeName")
        return renderer
    }

    /**
     * Renders tile (x, y, zoom) with the currently selected theme.
     * Returns PNG bytes, or null when the tile has no map data.
     */
    fun renderTile(x: Int, y: Int, zoom: Byte): ByteArray? {
        val themeName = themeManager.currentTheme
            ?: throw IllegalStateException("No theme selected")

        val renderer = getRenderer(themeName)
        val future = themeFutureCache[themeName]!!

        val tile = Tile(x, y, zoom, 256)
        val job = RendererJob(tile, mapDataStore, future, displayModel, 1.0f, false, false)

        val tileBitmap: TileBitmap? = synchronized(renderer) {
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
