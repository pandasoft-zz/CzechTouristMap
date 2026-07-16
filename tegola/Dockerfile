FROM ghcr.io/go-spatial/tegola:v0.15

COPY config.toml /app/config.toml

WORKDIR /app

ENTRYPOINT ["tegola", "serve", "--config", "config.toml"]
