package com.maprender

import org.yaml.snakeyaml.Yaml
import java.io.File

data class Location(
    val name: String,
    val lat: Double,
    val lng: Double,
    val zoom: Int,
    val note: String? = null,
)

class LocationManager(private val filePath: String) {

    private val file = File(filePath)

    fun list(): List<Location> {
        if (!file.exists()) return emptyList()
        val yaml = Yaml()
        @Suppress("UNCHECKED_CAST")
        val root = yaml.load<Map<String, Any?>>(file.inputStream()) ?: return emptyList()
        @Suppress("UNCHECKED_CAST")
        val raw = root["locations"] as? List<Map<String, Any?>> ?: return emptyList()
        return raw.mapNotNull { map ->
            val name = map["name"] as? String ?: return@mapNotNull null
            val lat  = (map["lat"]  as? Number)?.toDouble() ?: return@mapNotNull null
            val lng  = (map["lng"]  as? Number)?.toDouble() ?: return@mapNotNull null
            val zoom = (map["zoom"] as? Number)?.toInt() ?: return@mapNotNull null
            val note = map["note"] as? String
            Location(name, lat, lng, zoom, note)
        }
    }

    /** Appends a new location entry under the locations: key (preserves existing content). */
    fun append(location: Location) {
        file.parentFile?.mkdirs()
        val note = if (location.note != null) "\n    note: ${location.note}" else ""
        val entry = """
  - name: ${location.name}
    lat: ${location.lat}
    lng: ${location.lng}
    zoom: ${location.zoom}$note
"""
        file.appendText(entry)
    }

    /** Deletes the first location with the given name. Returns true if found and removed. */
    fun delete(name: String): Boolean {
        val all = list()
        val filtered = all.filter { it.name != name }
        if (filtered.size == all.size) return false
        rewrite(filtered)
        return true
    }

    private fun rewrite(locations: List<Location>) {
        val sb = StringBuilder()
        sb.appendLine("locations:")
        for (loc in locations) {
            sb.appendLine("  - name: ${loc.name}")
            sb.appendLine("    lat: ${loc.lat}")
            sb.appendLine("    lng: ${loc.lng}")
            sb.appendLine("    zoom: ${loc.zoom}")
            if (loc.note != null) sb.appendLine("    note: ${loc.note}")
        }
        file.parentFile?.mkdirs()
        file.writeText(sb.toString())
    }

    fun toJson(locations: List<Location>): String {
        val items = locations.joinToString(",") { loc ->
            val note = if (loc.note != null) ",\"note\":\"${loc.note.escJson()}\"" else ""
            """{"name":"${loc.name.escJson()}","lat":${loc.lat},"lng":${loc.lng},"zoom":${loc.zoom}$note}"""
        }
        return "[$items]"
    }

    private fun String.escJson() = replace("\\", "\\\\").replace("\"", "\\\"")
}
