#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
本地RAG API服务器测试脚本
用于验证部署是否成功
"""

import requests
import json
import time
import sys

# 配置
BASE_URL = "http://localhost:8000"
API_ENDPOINTS = {
    "health": "/api/health",
    "query": "/api/query",
    "build_kb": "/api/build_knowledge_base"
}

def test_server_health():
    """测试服务器健康状态"""
    print("🔍 测试服务器健康状态...")
    try:
        response = requests.get(f"{BASE_URL}/api/health", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ 服务器健康检查通过")
            print(f"   状态: {data.get('status')}")
            print(f"   RAG系统初始化: {data.get('rag_system_initialized')}")
            return True
        else:
            print(f"❌ 健康检查失败: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ 连接服务器失败: {e}")
        return False

def test_root_endpoint():
    """测试根端点"""
    print("\n🔍 测试根端点...")
    try:
        response = requests.get(f"{BASE_URL}/", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ 根端点访问成功")
            print(f"   消息: {data.get('message')}")
            print(f"   状态: {data.get('status')}")
            return True
        else:
            print(f"❌ 根端点访问失败: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ 连接服务器失败: {e}")
        return False

def test_query_endpoint():
    """测试查询端点"""
    print("\n🔍 测试查询端点...")
    
    # 测试数据
    test_questions = [
        "什么是计算机科学？",
        "如何学习编程？",
        "人工智能的发展历程"
    ]
    
    for question in test_questions:
        try:
            payload = {
                "question": question,
                "top_k_retrieve": 10,
                "top_k_final": 3
            }
            
            response = requests.post(
                f"{BASE_URL}/api/query",
                json=payload,
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ 查询成功: {question}")
                print(f"   回答长度: {len(data.get('answer', ''))}")
                print(f"   相关文档数: {len(data.get('relevant_docs', []))}")
                print(f"   分数: {data.get('scores', [])[:3]}")
            else:
                print(f"❌ 查询失败: {question} - {response.status_code}")
                if response.text:
                    print(f"   错误信息: {response.text}")
                    
        except requests.exceptions.RequestException as e:
            print(f"❌ 查询请求失败: {question} - {e}")

def test_build_knowledge_base():
    """测试构建知识库端点"""
    print("\n🔍 测试构建知识库端点...")
    try:
        response = requests.post(f"{BASE_URL}/api/build_knowledge_base", timeout=60)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ 知识库构建成功")
            print(f"   消息: {data.get('message')}")
        else:
            print(f"❌ 知识库构建失败: {response.status_code}")
            if response.text:
                print(f"   错误信息: {response.text}")
    except requests.exceptions.RequestException as e:
        print(f"❌ 构建知识库请求失败: {e}")

def test_api_documentation():
    """测试API文档访问"""
    print("\n🔍 测试API文档访问...")
    try:
        response = requests.get(f"{BASE_URL}/docs", timeout=10)
        if response.status_code == 200:
            print("✅ API文档访问成功")
            print("   您可以在浏览器中访问: http://localhost:8000/docs")
        else:
            print(f"❌ API文档访问失败: {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"❌ 访问API文档失败: {e}")

def wait_for_server():
    """等待服务器启动"""
    print("⏳ 等待服务器启动...")
    max_attempts = 30
    attempt = 0
    
    while attempt < max_attempts:
        try:
            response = requests.get(f"{BASE_URL}/api/health", timeout=5)
            if response.status_code == 200:
                print("✅ 服务器已启动！")
                return True
        except:
            pass
        
        attempt += 1
        print(f"   尝试 {attempt}/{max_attempts}...")
        time.sleep(2)
    
    print("❌ 服务器启动超时")
    return False

def main():
    """主函数"""
    print("🚀 RAG系统本地部署测试")
    print("=" * 40)
    
    # 等待服务器启动
    if not wait_for_server():
        print("\n❌ 测试失败：服务器未启动")
        print("请确保：")
        print("1. 已运行 local_ngrok_deploy.bat")
        print("2. Python服务器正在运行")
        print("3. 端口8000未被占用")
        sys.exit(1)
    
    print("\n" + "=" * 40)
    
    # 执行测试
    tests = [
        test_server_health,
        test_root_endpoint,
        test_query_endpoint,
        test_build_knowledge_base,
        test_api_documentation
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        try:
            if test():
                passed += 1
        except Exception as e:
            print(f"❌ 测试异常: {e}")
    
    print("\n" + "=" * 40)
    print(f"📊 测试结果: {passed}/{total} 通过")
    
    if passed == total:
        print("🎉 所有测试通过！RAG系统部署成功！")
        print("\n💡 下一步：")
        print("1. 在浏览器中访问: http://localhost:8000/docs")
        print("2. 测试API接口")
        print("3. 集成到前端应用")
    else:
        print("⚠️  部分测试失败，请检查服务器配置")
    
    print("\n🌐 如果配置了ngrok，您还可以：")
    print("1. 查看ngrok窗口获取公网地址")
    print("2. 使用公网地址从外部访问")
    print("3. 在移动设备上测试")

if __name__ == "__main__":
    main() 