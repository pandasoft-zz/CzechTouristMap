# ---- Build stage ----
FROM gradle:8-jdk17-alpine AS build

WORKDIR /app
COPY settings.gradle.kts build.gradle.kts ./
COPY src ./src

RUN gradle shadowJar --no-daemon --stacktrace

# ---- Run stage ----
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app
COPY --from=build /app/build/libs/*-all.jar app.jar

# Default environment variables (can be overridden in docker-compose)
ENV MAP_FILE=/data/maps/czech-republic.map
ENV THEMES_DIR=/data/themes

EXPOSE 8080

HEALTHCHECK --interval=10s --timeout=5s --start-period=30s --retries=5 \
  CMD wget -q -O- http://localhost:8080/health || exit 1

CMD ["java", "-Djava.awt.headless=true", "-Xmx512m", "-jar", "app.jar"]
