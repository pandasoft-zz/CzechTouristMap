plugins {
    kotlin("jvm") version "1.9.23"
    application
    id("com.github.johnrengelman.shadow") version "8.1.1"
}

application {
    // Kotlin top-level fun main() compiles to TileServerKt
    mainClass.set("com.maprender.TileServerKt")
}

repositories {
    mavenCentral()
}

val mapsforgeVersion = "0.21.0"

dependencies {
    implementation(kotlin("stdlib"))
    implementation("org.mapsforge:mapsforge-core:$mapsforgeVersion")
    implementation("org.mapsforge:mapsforge-map:$mapsforgeVersion")
    implementation("org.mapsforge:mapsforge-map-reader:$mapsforgeVersion")
    implementation("org.mapsforge:mapsforge-map-awt:$mapsforgeVersion")
    implementation("org.slf4j:slf4j-simple:2.0.9")
}

kotlin {
    jvmToolchain(17)
}

// Only compile Kotlin sources; ignore the stub .java files
sourceSets {
    main {
        java { setSrcDirs(emptyList<File>()) }
        kotlin { srcDir("src/main/kotlin") }
    }
}

tasks.shadowJar {
    archiveClassifier.set("all")
    mergeServiceFiles()
}
