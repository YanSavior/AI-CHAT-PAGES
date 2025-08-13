#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
测试Vercel API部署
"""

import requests
import json

def test_local_api():
    """测试本地API"""
    print("🧪 测试本地API...")
    
    base_url = "http://localhost:8000"
    
    # 测试健康检查
    try:
        response = requests.get(f"{base_url}/api/health")
        print(f"✅ 健康检查: {response.status_code} - {response.json()}")
    except Exception as e:
        print(f"❌ 健康检查失败: {e}")
        return False
    
    # 测试查询接口
    try:
        query_data = {
            "question": "重庆邮电大学软件工程专业怎么样？",
            "top_k_retrieve": 5,
            "top_k_final": 3
        }
        
        response = requests.post(f"{base_url}/api/query", json=query_data)
        result = response.json()
        
        print(f"✅ 查询测试: {response.status_code}")
        print(f"📝 问题: {result['question']}")
        print(f"📄 相关文档数量: {len(result['relevant_docs'])}")
        print(f"📊 相关文档: {result['relevant_docs']}")
        print(f"🎯 分数: {result['scores']}")
        
    except Exception as e:
        print(f"❌ 查询测试失败: {e}")
        return False
    
    return True

def test_vercel_api(vercel_url):
    """测试Vercel部署的API"""
    print(f"🌐 测试Vercel API: {vercel_url}")
    
    # 测试健康检查
    try:
        response = requests.get(f"{vercel_url}/api/health")
        print(f"✅ Vercel健康检查: {response.status_code} - {response.json()}")
    except Exception as e:
        print(f"❌ Vercel健康检查失败: {e}")
        return False
    
    # 测试查询接口
    try:
        query_data = {
            "question": "机械工程专业就业前景如何？",
            "top_k_retrieve": 5,
            "top_k_final": 3
        }
        
        response = requests.post(f"{vercel_url}/api/query", json=query_data)
        result = response.json()
        
        print(f"✅ Vercel查询测试: {response.status_code}")
        print(f"📝 问题: {result['question']}")
        print(f"📄 相关文档数量: {len(result['relevant_docs'])}")
        print(f"📊 相关文档: {result['relevant_docs']}")
        print(f"🎯 分数: {result['scores']}")
        
    except Exception as e:
        print(f"❌ Vercel查询测试失败: {e}")
        return False
    
    return True

if __name__ == "__main__":
    print("🚀 RAG API测试工具")
    print("=" * 50)
    
    # 测试本地API
    if test_local_api():
        print("✅ 本地API测试通过")
    else:
        print("❌ 本地API测试失败")
    
    print("\n" + "=" * 50)
    
    # 测试Vercel API
    vercel_url = input("请输入Vercel部署的URL (例: https://your-project.vercel.app): ").strip()
    if vercel_url:
        if test_vercel_api(vercel_url):
            print("✅ Vercel API测试通过")
        else:
            print("❌ Vercel API测试失败")
    else:
        print("⏭️ 跳过Vercel API测试")
    
    print("\n🎉 测试完成！")