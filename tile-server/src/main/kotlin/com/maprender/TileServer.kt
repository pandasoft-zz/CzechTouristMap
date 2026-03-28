package com.maprender

import com.sun.net.httpserver.HttpExchange
import com.sun.net.httpserver.HttpServer
import java.net.InetSocketAddress
import java.nio.charset.StandardCharsets
import java.util.concurrent.Executors

fun main() {
    System.setProperty("java.awt.headless", "true")

    val mapFilePath = System.getenv("MAP_FILE") ?: "/data/maps/czech-republic.map"
    val themesDirPath = System.getenv("THEMES_DIR") ?: "/data/themes"
    val locationsFilePath = System.getenv("LOCATIONS_FILE") ?: "/data/config/locations.yaml"

    println("Starting map tile server...")
    println("Map:    $mapFilePath")
    println("Themes: $themesDirPath")
    println("Locations: $locationsFilePath")

    val themeManager = ThemeManager(themesDirPath)
    val locationManager = LocationManager(locationsFilePath)

    val tileRenderer: TileRenderer? =
        try {
            TileRenderer(mapFilePath, themeManager)
        } catch (e: Exception) {
            System.err.println("ERROR loading map: ${e.message}")
            System.err.println("Place your .map file at: $mapFilePath")
            null
        }

    val server = HttpServer.create(InetSocketAddress(8080), 50)

    server.createContext("/tiles/") { handleTile(it, tileRenderer, themeManager) }
    server.createContext("/render") { handleRender(it, tileRenderer) }
    server.createContext("/locations") { handleLocations(it, locationManager) }
    server.createContext("/themes/select/") { handleSelectTheme(it, themeManager) }
    server.createContext("/themes/current") { handleCurrentTheme(it, themeManager) }
    server.createContext("/themes") { handleThemes(it, themeManager) }
    server.createContext("/health") { handleHealth(it, tileRenderer, themeManager) }

    server.executor = Executors.newFixedThreadPool(8)
    server.start()

    println("Tile server running at http://localhost:8080")
    println("Available themes: ${themeManager.listThemes()}")
}

// ── Handlers ──────────────────────────────────────────────────────────────────

// GET /tiles/{z}/{x}/{y}.png
private fun handleTile(
    exchange: HttpExchange,
    renderer: TileRenderer?,
    themeManager: ThemeManager,
) {
    exchange.addCors()
    if (exchange.requestMethod == "OPTIONS") {
        exchange.sendResponseHeaders(200, -1)
        exchange.close()
        return
    }

    if (renderer == null) {
        exchange.sendError(503, "Map file not loaded – check server logs")
        return
    }

    try {
        // URL: /tiles/{z}/{x}/{y}.png
        val parts =
            exchange.requestURI.path
                .removePrefix("/tiles/")
                .removeSuffix(".png")
                .split("/")

        require(parts.size == 3) { "Invalid tile URL" }
        val z = parts[0].toInt()
        val x = parts[1].toInt()
        val y = parts[2].toInt()

        val png = renderer.renderTile(x, y, z.toByte())
        if (png == null) {
            exchange.sendResponseHeaders(204, -1)
            exchange.close()
            return
        }

        exchange.responseHeaders.set("Content-Type", "image/png")
        exchange.responseHeaders.set("Cache-Control", "no-cache")
        exchange.sendResponseHeaders(200, png.size.toLong())
        exchange.responseBody.write(png)
    } catch (e: NumberFormatException) {
        exchange.sendError(400, "Invalid tile coordinates")
    } catch (e: Exception) {
        System.err.println("Tile render error: ${e.message}")
        e.printStackTrace()
        exchange.sendError(500, e.message ?: "Render error")
    } finally {
        exchange.close()
    }
}

// GET /render?lat=49.95&lng=15.27&zoom=14&width=800&height=600  →  PNG image
private fun handleRender(
    exchange: HttpExchange,
    renderer: TileRenderer?,
) {
    exchange.addCors()
    if (renderer == null) {
        exchange.sendError(503, "Map file not loaded")
        return
    }

    try {
        val params =
            exchange.requestURI.query
                ?.split("&")
                ?.associate { it.substringBefore("=") to it.substringAfter("=") }
                ?: emptyMap()

        val lat = params["lat"]?.toDouble() ?: 49.8
        val lng = params["lng"]?.toDouble() ?: 15.5
        val zoom = params["zoom"]?.toInt() ?: 12
        val width = params["width"]?.toInt() ?: 800
        val height = params["height"]?.toInt() ?: 600

        require(zoom in 2..18) { "zoom must be 2–18" }
        require(width in 64..4096) { "width must be 64–4096" }
        require(height in 64..4096) { "height must be 64–4096" }

        val png = renderer.renderArea(lat, lng, zoom, width, height)

        exchange.responseHeaders.set("Content-Type", "image/png")
        exchange.responseHeaders.set("Cache-Control", "no-cache")
        exchange.sendResponseHeaders(200, png.size.toLong())
        exchange.responseBody.write(png)
    } catch (e: IllegalArgumentException) {
        exchange.sendError(400, e.message ?: "Bad request")
    } catch (e: Exception) {
        System.err.println("Render error: ${e.message}")
        e.printStackTrace()
        exchange.sendError(500, e.message ?: "Render error")
    } finally {
        exchange.close()
    }
}

// GET /locations          →  JSON array of all locations
// POST /locations         →  body: name=…&lat=…&lng=…&zoom=…&note=…  →  appends entry
private fun handleLocations(
    exchange: HttpExchange,
    locationManager: LocationManager,
) {
    exchange.addCors()
    if (exchange.requestMethod == "OPTIONS") {
        exchange.sendResponseHeaders(200, -1)
        exchange.close()
        return
    }

    when (exchange.requestMethod) {
        "GET" -> {
            val list = locationManager.list()
            exchange.sendJson(200, locationManager.toJson(list))
        }
        "POST" -> {
            try {
                val body = exchange.requestBody.readBytes().toString(Charsets.UTF_8)
                val params =
                    body.split("&").associate {
                        it.substringBefore("=") to java.net.URLDecoder.decode(it.substringAfter("="), "UTF-8")
                    }
                val name =
                    params["name"]?.takeIf { it.isNotBlank() }
                        ?: throw IllegalArgumentException("name is required")
                val lat =
                    params["lat"]?.toDoubleOrNull()
                        ?: throw IllegalArgumentException("lat is required")
                val lng =
                    params["lng"]?.toDoubleOrNull()
                        ?: throw IllegalArgumentException("lng is required")
                val zoom =
                    params["zoom"]?.trim()?.toIntOrNull()
                        ?: throw IllegalArgumentException("zoom is required and must be an integer")
                val note = params["note"]?.takeIf { it.isNotBlank() }
                locationManager.append(Location(name, lat, lng, zoom, note))
                exchange.sendJson(201, """{"success":true}""")
            } catch (e: IllegalArgumentException) {
                exchange.sendError(400, e.message ?: "Bad request")
            } catch (e: Exception) {
                System.err.println("Locations POST error: ${e.message}")
                exchange.sendError(500, e.message ?: "Server error")
            }
        }
        "DELETE" -> {
            val name =
                exchange.requestURI.query
                    ?.split("&")
                    ?.associate {
                        it.substringBefore("=") to
                            java.net.URLDecoder.decode(it.substringAfter("="), "UTF-8")
                    }?.get("name")
                    ?: run {
                        exchange.sendError(400, "name query param required")
                        return
                    }
            if (locationManager.delete(name)) {
                exchange.sendJson(200, """{"success":true}""")
            } else {
                exchange.sendJson(404, """{"success":false,"error":"Not found"}""")
            }
        }
        else -> exchange.sendError(405, "Method not allowed")
    }
}

// GET /themes  →  ["default.xml","dark.xml",...]
private fun handleThemes(
    exchange: HttpExchange,
    themeManager: ThemeManager,
) {
    exchange.addCors()
    val list = themeManager.listThemes().joinToString(",") { "\"${it.escJson()}\"" }
    exchange.sendJson(200, "[$list]")
}

// GET /themes/current  →  "default.xml"
private fun handleCurrentTheme(
    exchange: HttpExchange,
    themeManager: ThemeManager,
) {
    exchange.addCors()
    exchange.sendJson(200, "\"${(themeManager.currentTheme ?: "").escJson()}\"")
}

// POST /themes/select/{name}
private fun handleSelectTheme(
    exchange: HttpExchange,
    themeManager: ThemeManager,
) {
    exchange.addCors()
    if (exchange.requestMethod == "OPTIONS") {
        exchange.sendResponseHeaders(200, -1)
        exchange.close()
        return
    }

    val name = exchange.requestURI.path.removePrefix("/themes/select/")
    if (themeManager.listThemes().contains(name)) {
        themeManager.setCurrentTheme(name)
        exchange.sendJson(200, """{"success":true,"theme":"${name.escJson()}"}""")
    } else {
        exchange.sendJson(404, """{"success":false,"error":"Theme not found: ${name.escJson()}"}""")
    }
}

// GET /health
private fun handleHealth(
    exchange: HttpExchange,
    renderer: TileRenderer?,
    themeManager: ThemeManager,
) {
    exchange.addCors()
    val loaded = renderer != null
    val theme = (themeManager.currentTheme ?: "").escJson()
    val count = themeManager.listThemes().size
    val json = """{"status":"ok","mapLoaded":$loaded,"currentTheme":"$theme","themes":$count}"""
    exchange.sendJson(200, json)
}

// ── Extensions ────────────────────────────────────────────────────────────────

private fun HttpExchange.addCors() {
    responseHeaders.set("Access-Control-Allow-Origin", "*")
    responseHeaders.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
    responseHeaders.set("Access-Control-Allow-Headers", "Content-Type")
}

private fun HttpExchange.sendJson(
    status: Int,
    json: String,
) {
    val bytes = json.toByteArray(StandardCharsets.UTF_8)
    responseHeaders.set("Content-Type", "application/json; charset=utf-8")
    sendResponseHeaders(status, bytes.size.toLong())
    responseBody.write(bytes)
    close()
}

private fun HttpExchange.sendError(
    status: Int,
    message: String,
) {
    sendJson(status, """{"error":"${message.escJson()}"}""")
}

private fun String.escJson() = replace("\\", "\\\\").replace("\"", "\\\"")
