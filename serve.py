#!/usr/bin/env python3
"""Tiny static file server for Synapse Reef.

ES modules can't be loaded from a file:// URL (browsers block it), so the
project needs to be *served*. This does that with one command:

    python3 serve.py            # then open http://localhost:8000
    python3 serve.py 9000       # custom port

Responses are sent with no-store so edits always show up on reload
(no stale-cache surprises during development).
"""
import http.server
import sys
import os

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
os.chdir(os.path.dirname(os.path.abspath(__file__)))


class Handler(http.server.SimpleHTTPRequestHandler):
    # HTTP/1.1 + a threading server so the many ES-module requests a browser fires in
    # parallel (with keep-alive) don't serialize behind one another and stall.
    protocol_version = "HTTP/1.1"

    extensions_map = {
        **http.server.SimpleHTTPRequestHandler.extensions_map,
        ".js": "text/javascript",
        ".mjs": "text/javascript",
        ".css": "text/css",
        ".json": "application/json",
    }

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def log_message(self, *args):
        pass  # quiet


if __name__ == "__main__":
    # ThreadingHTTPServer (stdlib, 3.7+) handles each connection on its own thread.
    httpd = http.server.ThreadingHTTPServer(("", PORT), Handler)
    httpd.daemon_threads = True
    print(f"Synapse Reef  ->  http://localhost:{PORT}   (Ctrl+C to stop)")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nstopped.")
    finally:
        httpd.server_close()
