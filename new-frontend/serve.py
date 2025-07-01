#!/usr/bin/env python3
"""
Simple HTTP server for the new ProjectHub frontend
Serves the modern UI without any React complications
"""

import http.server
import socketserver
import os
import json
from urllib.parse import urlparse

PORT = 8080
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class ProjectHubHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)
    
    def end_headers(self):
        # Add CORS headers
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()
    
    def do_GET(self):
        # Serve API mock data for testing
        parsed_path = urlparse(self.path)
        
        if parsed_path.path == '/api/health':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'status': 'ok', 'message': 'ProjectHub New Frontend'}).encode())
        else:
            # Serve static files
            super().do_GET()

print(f"🚀 Starting ProjectHub New Frontend on port {PORT}")
print(f"📁 Serving from: {DIRECTORY}")
print(f"🌐 Access at: http://localhost:>{PORT}")
print(f"🌐 Network access: http://172.28.173.145:{PORT}")
print("\nPress Ctrl+C to stop the server")

with socketserver.TCPServer(("", PORT), ProjectHubHandler) as httpd:
    httpd.serve_forever()