#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
简化的RAG系统API服务器
"""

import json
import os
from http.server import HTTPServer, BaseHTTPRequestHandler

class SimpleRAGAPIHandler(BaseHTTPRequestHandler):
    
    def do_GET(self):
        if self.path == '/':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            response = {
                "message": "RAG系统API服务",
                "status": "running",
                "version": "1.0.0"
            }
            self.wfile.write(json.dumps(response, ensure_ascii=False).encode('utf-8'))
            
        elif self.path == '/api/health':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            response = {"status": "healthy"}
            self.wfile.write(json.dumps(response, ensure_ascii=False).encode('utf-8'))
            
        else:
            self.send_response(404)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            response = {"error": "Not found"}
            self.wfile.write(json.dumps(response, ensure_ascii=False).encode('utf-8'))

def run_server(port=8000):
    server_address = ('', port)
    httpd = HTTPServer(server_address, SimpleRAGAPIHandler)
    print(f"🚀 简化的RAG API服务器启动成功！")
    print(f"📡 服务器地址: http://localhost:{port}")
    print(f"🔗 在浏览器中访问: http://localhost:{port}")
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n👋 服务器已停止")

if __name__ == "__main__":
    run_server() 