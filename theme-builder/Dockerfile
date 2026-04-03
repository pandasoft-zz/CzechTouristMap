FROM ubuntu:24.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y \
    xsltproc \
    python3 \
    && rm -rf /var/lib/apt/lists/*

ENV STYLE=CzechTouristMap

EXPOSE 5000

CMD ["python3", "/app/server.py"]
