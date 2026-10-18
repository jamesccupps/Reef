#!/usr/bin/env python3
"""Tiny static file server for Synapse Reef (the Python twin of serve.mjs).

ES modules can't be loaded from a file:// URL (browsers block it), so the
project needs to be *served*. This does that with one command:

    python3 serve.py            # then open http://localhost:8000
    python3 serve.py 9000       # custom port
    node serve.mjs              # same thing without Python (stock Windows has no python3)

Local-development only, and locked down to match:
  * binds 127.0.0.1 (not every interface);
  * rejects a Host header that isn't localhost / 127.0.0.1 (blocks DNS rebinding);
  * no directory listings: "/" serves index.html, any other directory is 404;
  * refuses dot-paths (/.git, /.claude) -- also on the real on-disk path, so Windows
    8.3 aliases (CLAUDE~1) and links can't sneak past -- and blocks traversal;
  * sends no-store (edits always show on reload), nosniff, and the page's CSP.
"""
import http.server
import os
import re
import sys
import urllib.parse

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
HOST = "127.0.0.1"
ROOT = os.path.dirname(os.path.abspath(__file__))
ALLOWED_HOSTS = {"localhost", "127.0.0.1"}
# keep in sync with the <meta http-equiv="Content-Security-Policy"> in index.html and CSP in serve.mjs
CSP = ("default-src 'self'; script-src 'self'; style-src 'self' https://fonts.googleapis.com; "
       "font-src https://fonts.gstatic.com; img-src 'self' data: blob:; connect-src 'self'; object-src 'none'; "
       "base-uri 'none'; form-action 'none'")
MIME = {
    ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".mjs": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8", ".json": "application/json; charset=utf-8", ".svg": "image/svg+xml", ".png": "image/png",
    ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".gif": "image/gif", ".webp": "image/webp", ".ico": "image/x-icon",
    ".woff2": "font/woff2", ".md": "text/plain; charset=utf-8", ".txt": "text/plain; charset=utf-8",
}
_HOST_RE = re.compile(r"^([a-z0-9.\-]+)(?::(\d{1,5}))?$")


def host_allowed(host):
    m = _HOST_RE.match((host or "").strip().lower())
    return bool(m) and m.group(1) in ALLOWED_HOSTS


def _inside(path, root):
    rel = os.path.relpath(path, root)
    return rel != "." and not rel.startswith("..") and not os.path.isabs(rel), rel


class Handler(http.server.SimpleHTTPRequestHandler):
    # HTTP/1.1 + a threading server so the many ES-module requests a browser fires in
    # parallel (with keep-alive) don't serialize behind one another and stall.
    protocol_version = "HTTP/1.1"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def guess_type(self, path):
        return MIME.get(os.path.splitext(path)[1].lower(), "application/octet-stream")

    # cross-origin isolation for the 3-D page (its sim's shards share memory): COOP + COEP on w3.html, COEP on the scripts —
    # keep in sync with isoHeaders in serve.mjs
    _iso = {}

    def end_headers(self):
        for k, v in self._iso.items():
            self.send_header(k, v)
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Security-Policy", CSP)
        self.send_header("X-Content-Type-Options", "nosniff")
        super().end_headers()

    def _resolve(self):
        """Map the request path to a file under ROOT, or None (-> 404)."""
        raw = urllib.parse.urlsplit(self.path).path
        try:
            dec = urllib.parse.unquote(raw, errors="strict")
        except UnicodeDecodeError:
            return None
        if not dec.startswith("/"):
            return None
        segs = [s for s in re.split(r"[\\/]", dec) if s]
        if any(s.startswith(".") or ":" in s or "\0" in s for s in segs):
            return None
        if not segs:
            segs = ["index.html"]  # "/" -> the app
        full = os.path.abspath(os.path.join(ROOT, *segs))
        ok, _ = _inside(full, ROOT)
        if not ok:
            return None
        # the real (long-name, link-resolved) path must also stay inside ROOT with no dot-segment
        real_root = os.path.realpath(ROOT)
        real = os.path.realpath(full)
        ok, rel = _inside(real, real_root)
        if not ok or any(s.startswith(".") for s in rel.split(os.sep)):
            return None
        return real if os.path.isfile(real) else None  # directories -> 404 (no listings)

    def send_head(self):
        if not host_allowed(self.headers.get("Host")):
            self.send_error(403, "Forbidden: this server only answers to localhost")
            return None
        path = self._resolve()
        if path is None:
            self.send_error(404, "Not found")
            return None
        try:
            f = open(path, "rb")
        except OSError:
            self.send_error(404, "Not found")
            return None
        try:
            fs = os.fstat(f.fileno())
            rel = os.path.relpath(path, os.path.realpath(ROOT)).replace(os.sep, "/")
            self._iso = ({"Cross-Origin-Opener-Policy": "same-origin", "Cross-Origin-Embedder-Policy": "require-corp"} if rel == "w3.html"
                         else {"Cross-Origin-Embedder-Policy": "require-corp"} if re.search(r"\.m?js$", rel) else {})
            self.send_response(200)
            self.send_header("Content-Type", self.guess_type(path))
            self.send_header("Content-Length", str(fs.st_size))
            self.end_headers()
            return f
        except Exception:
            f.close()
            raise

    def list_directory(self, path):  # never list (send_head above never gets here; belt and braces)
        self.send_error(404, "Not found")
        return None

    def log_message(self, *args):
        pass  # quiet


if __name__ == "__main__":
    # ThreadingHTTPServer (stdlib, 3.7+) handles each connection on its own thread.
    httpd = http.server.ThreadingHTTPServer((HOST, PORT), Handler)
    httpd.daemon_threads = True
    print(f"Synapse Reef  ->  http://localhost:{PORT}   (also http://127.0.0.1:{PORT}; Ctrl+C to stop)")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nstopped.")
    finally:
        httpd.server_close()
