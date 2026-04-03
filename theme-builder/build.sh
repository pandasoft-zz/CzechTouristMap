#!/bin/sh
set -e
xsltproc "/app/styles/${STYLE}/${STYLE}.xslt" > "/data/themes/${STYLE}.xml"
echo "Built /data/themes/${STYLE}.xml ($(wc -c < "/data/themes/${STYLE}.xml") bytes)"
