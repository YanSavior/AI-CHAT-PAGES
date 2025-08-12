#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
测试ngrok公网访问的RAG系统
"""

import requests
import json
import time

# ngrok公网地址
NGROK_URL = "https://73c04998c907.ngrok-free.app"

def test_health_check():
    """测试健康检查"""
    print("🔍 测试健康检查...")
    try:
        response = requests.get(f"{NGROK_URL}/api/health", timeout=10)
        if response.status_code == 200:
            print("✅ 健康检查成功")
            print(f"   响应: {response.json()}")
            return True
        else:
            print(f"❌ 健康检查失败: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ 健康检查异常: {e}")
        return False

def test_root_endpoint():
    """测试根端点"""
    print("\n🔍 测试根端点...")
    try:
        response = requests.get(f"{NGROK_URL}/", timeout=10)
        if response.status_code == 200:
            print("✅ 根端点访问成功")
            print(f"   响应: {response.json()}")
            return True
        else:
            print(f"❌ 根端点访问失败: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ 根端点访问异常: {e}")
        return False

def test_query_endpoint():
    """测试查询端点"""
    print("\n🔍 测试查询端点...")
    
    # 测试问题
    test_questions = [
        "什么是RAG系统？",
        "如何构建知识库？",
        "向量数据库的作用是什么？"
    ]
    
    for question in test_questions:
        print(f"\n   测试问题: {question}")
        try:
            payload = {
                "question": question,
                "top_k_retrieve": 5,
                "top_k_final": 3
            }
            
            response = requests.post(
                f"{NGROK_URL}/api/query",
                json=payload,
                timeout=30,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                result = response.json()
                print(f"   ✅ 查询成功")
                print(f"   答案: {result.get('answer', 'N/A')[:100]}...")
                print(f"   相关文档数: {len(result.get('relevant_docs', []))}")
                print(f"   分数: {result.get('scores', [])[:3]}")
            else:
                print(f"   ❌ 查询失败: {response.status_code}")
                print(f"   错误: {response.text}")
                
        except Exception as e:
            print(f"   ❌ 查询异常: {e}")

def test_knowledge_base_build():
    """测试知识库构建"""
    print("\n🔍 测试知识库构建...")
    try:
        response = requests.post(f"{NGROK_URL}/api/build_knowledge_base", timeout=60)
        if response.status_code == 200:
            print("✅ 知识库构建成功")
            print(f"   响应: {response.json()}")
            return True
        else:
            print(f"❌ 知识库构建失败: {response.status_code}")
            print(f"   错误: {response.text}")
            return False
    except Exception as e:
        print(f"❌ 知识库构建异常: {e}")
        return False

def main():
    """主测试函数"""
    print("🚀 开始测试ngrok公网访问的RAG系统")
    print("=" * 50)
    print(f"🌐 公网地址: {NGROK_URL}")
    print(f"📍 本地地址: http://localhost:8000")
    print("=" * 50)
    
    # 等待一下，确保服务器完全启动
    print("\n⏳ 等待服务器启动...")
    time.sleep(3)
    
    # 测试各个端点
    health_ok = test_health_check()
    if not health_ok:
        print("\n❌ 健康检查失败，服务器可能未启动")
        return
    
    root_ok = test_root_endpoint()
    if not root_ok:
        print("\n⚠️  根端点访问失败，但继续测试其他功能")
    
    # 测试查询功能
    test_query_endpoint()
    
    # 测试知识库构建
    print("\n" + "=" * 50)
    print("🎯 测试完成！")
    print("\n💡 使用说明:")
    print(f"1. 本地访问: http://localhost:8000")
    print(f"2. 公网访问: {NGROK_URL}")
    print(f"3. API文档: {NGROK_URL}/docs")
    print(f"4. 健康检查: {NGROK_URL}/api/health")
    print(f"5. 查询接口: POST {NGROK_URL}/api/query")
    
    print("\n⚠️  注意事项:")
    print("- ngrok免费版每次重启会生成新的公网地址")
    print("- 如果遇到CORS问题，请检查浏览器控制台")
    print("- 建议先构建知识库再测试查询功能")

if __name__ == "__main__":
    main() 