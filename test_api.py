#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
测试API服务器
"""

import urllib.request
import json

def test_api():
    try:
        # 测试根路径
        print("🔍 测试API服务器...")
        response = urllib.request.urlopen('http://localhost:8000')
        data = json.loads(response.read().decode('utf-8'))
        print("✅ API服务器响应:")
        print(json.dumps(data, ensure_ascii=False, indent=2))
        
        # 测试健康检查
        print("\n🔍 测试健康检查...")
        response = urllib.request.urlopen('http://localhost:8000/api/health')
        data = json.loads(response.read().decode('utf-8'))
        print("✅ 健康检查响应:")
        print(json.dumps(data, ensure_ascii=False, indent=2))
        
        print("\n🎉 API服务器运行正常！")
        print("🌐 你可以在浏览器中访问: http://localhost:8000")
        
    except Exception as e:
        print(f"❌ API服务器测试失败: {e}")
        print("💡 请确保API服务器正在运行")

if __name__ == "__main__":
    test_api() 