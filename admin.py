#!/usr/bin/env python3
"""
Portfolio Local Admin Server
Runs a local zero-dependency HTTP server to visually edit data/content.json,
sync projects from GitHub, and optionally commit & push changes to GitHub Pages.

Usage:
    python3 admin.py [port]
Default port: 8080
"""

import http.server
import json
import os
import subprocess
import sys
import urllib.parse

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8080
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CONTENT_FILE = os.path.join(BASE_DIR, "data", "content.json")


class AdminRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=BASE_DIR, **kwargs)

    def do_GET(self):
        if self.path == "/" or self.path == "":
            self.send_response(302)
            self.send_header("Location", "/index.html")
            self.end_headers()
            return
        elif self.path == "/admin" or self.path == "/admin/":
            self.send_response(302)
            self.send_header("Location", "/admin/index.html")
            self.end_headers()
            return
        elif self.path == "/api/status":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"status": "running", "mode": "local_server"}).encode())
            return
        elif self.path == "/api/content":
            if os.path.exists(CONTENT_FILE):
                with open(CONTENT_FILE, "r", encoding="utf-8") as f:
                    data = f.read()
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(data.encode())
            else:
                self.send_error(404, "content.json not found")
            return

        super().do_GET()

    def do_POST(self):
        if self.path == "/api/save":
            content_length = int(self.headers.get("Content-Length", 0))
            post_body = self.rfile.read(content_length)
            try:
                # Validate JSON
                parsed = json.loads(post_body.decode("utf-8"))
                with open(CONTENT_FILE, "w", encoding="utf-8") as f:
                    json.dump(parsed, f, indent=2, ensure_ascii=False)
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"success": True, "message": "Saved to data/content.json"}).encode())
            except Exception as e:
                self.send_response(500)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"success": False, "error": str(e)}).encode())
            return

        elif self.path == "/api/git-push":
            content_length = int(self.headers.get("Content-Length", 0))
            post_body = self.rfile.read(content_length)
            try:
                commit_msg = "Update portfolio content via Admin Studio"
                if post_body:
                    try:
                        req_data = json.loads(post_body.decode("utf-8"))
                        if req_data.get("message"):
                            commit_msg = req_data["message"]
                    except Exception:
                        pass

                # Run git commands
                add_res = subprocess.run(["git", "add", "data/content.json"], cwd=BASE_DIR, capture_output=True, text=True)
                commit_res = subprocess.run(["git", "commit", "-m", commit_msg], cwd=BASE_DIR, capture_output=True, text=True)
                push_res = subprocess.run(["git", "push"], cwd=BASE_DIR, capture_output=True, text=True)

                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({
                    "success": push_res.returncode == 0,
                    "stdout": push_res.stdout + commit_res.stdout,
                    "stderr": push_res.stderr + commit_res.stderr
                }).encode())
            except Exception as e:
                self.send_response(500)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"success": False, "error": str(e)}).encode())
            return

        self.send_error(404, "Endpoint not found")


def run():
    server_address = ("", PORT)
    httpd = http.server.HTTPServer(server_address, AdminRequestHandler)
    print("=" * 60)
    print(f" Portfolio Studio is running at: http://localhost:{PORT}/admin/")
    print(f" Public Portfolio preview:       http://localhost:{PORT}/")
    print("=" * 60)
    print(" Press Ctrl+C to stop the server.\n")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping server...")
        httpd.server_close()


if __name__ == "__main__":
    run()
