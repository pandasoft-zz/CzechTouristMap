package com.maprender

import java.io.File

class ThemeManager(themesDirPath: String) {

    private val themesDir = File(themesDirPath)

    @Volatile
    var currentTheme: String? = null
        private set

    init {
        if (!themesDir.exists()) {
            System.err.println("WARNING: Themes directory does not exist: $themesDirPath")
        }
        val themes = listThemes()
        if (themes.isNotEmpty()) {
            currentTheme = themes.first()
            println("Default theme set to: $currentTheme")
        } else {
            System.err.println("WARNING: No XML themes found in: $themesDirPath")
        }
    }

    fun listThemes(): List<String> {
        if (!themesDir.exists() || !themesDir.isDirectory) return emptyList()
        return themesDir
            .listFiles { _, name -> name.lowercase().endsWith(".xml") }
            ?.map { it.name }
            ?.sorted()
            ?: emptyList()
    }

    @Synchronized
    fun setCurrentTheme(theme: String) {
        currentTheme = theme
        println("Active theme changed to: $theme")
    }

    fun getThemeFile(theme: String): File = File(themesDir, theme)

    fun getCurrentThemeFile(): File? = currentTheme?.let { getThemeFile(it) }
}
