#!/usr/bin/env python3
"""Minimal HTTP server that rebuilds the Mapsforge theme XML from XSLT source."""
import json
import os
import subprocess
from http.server import BaseHTTPRequestHandler, HTTPServer

STYLE = os.environ.get("STYLE", "CzechTouristMap")
XSLT_FILE = f"/app/styles/{STYLE}/{STYLE}.xslt"
OUTPUT_FILE = f"/data/themes/{STYLE}.xml"


class Handler(BaseHTTPRequestHandler):
    def log_message(self, fmt, *args):
        print(fmt % args, flush=True)

    def do_GET(self):
        if self.path != "/health":
            self._send(404, {"error": "not found"})
            return
        self._send(200, {"status": "ok"})

    def do_POST(self):
        if self.path != "/build":
            self._send(404, {"error": "not found"})
            return
        try:
            result = subprocess.run(
                ["xsltproc", XSLT_FILE],
                capture_output=True,
                timeout=120,
            )
            if result.returncode != 0:
                err = result.stderr.decode(errors="replace")[:500]
                print(f"xsltproc failed: {err}", flush=True)
                self._send(500, {"success": False, "error": err})
                return
            xml = result.stdout
            with open(OUTPUT_FILE, "wb") as fh:
                fh.write(xml)
            print(f"Theme rebuilt: {OUTPUT_FILE} ({len(xml)} bytes)", flush=True)
            self._send(200, {"success": True, "bytes": len(xml)})
        except subprocess.TimeoutExpired:
            self._send(500, {"success": False, "error": "xsltproc timed out after 120s"})
        except Exception as exc:
            self._send(500, {"success": False, "error": str(exc)})

    def _send(self, status: int, body: dict):
        data = json.dumps(body).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)


if __name__ == "__main__":
    print(f"Theme builder ready: {XSLT_FILE} → {OUTPUT_FILE}", flush=True)
    HTTPServer(("0.0.0.0", 5000), Handler).serve_forever()
