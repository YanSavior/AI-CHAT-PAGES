#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
RAG API测试脚本
"""

import requests
import json
import time

def test_rag_api():
    """测试RAG API服务器"""
    base_url = "http://localhost:8000"
    
    print("🧪 RAG API测试开始...")
    print("=" * 50)
    
    # 1. 健康检查
    print("1. 健康检查测试")
    try:
        response = requests.get(f"{base_url}/api/health", timeout=10)
        print(f"   状态码: {response.status_code}")
        print(f"   响应: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
        print("   ✅ 健康检查通过")
    except Exception as e:
        print(f"   ❌ 健康检查失败: {e}")
        return False
    
    print("\n" + "-" * 30 + "\n")
    
    # 2. 查询测试
    print("2. 查询接口测试")
    test_questions = [
        "重庆邮电大学软件工程专业怎么样？",
        "机械工程专业的就业前景如何？",
        "计算机专业需要学习哪些课程？"
    ]
    
    for i, question in enumerate(test_questions, 1):
        print(f"   测试问题 {i}: {question}")
        try:
            start_time = time.time()
            response = requests.post(
                f"{base_url}/api/query",
                json={
                    "question": question,
                    "quote": True,
                    "temperature": 0.1,
                    "max_tokens": 512
                },
                timeout=30
            )
            end_time = time.time()
            
            print(f"   状态码: {response.status_code}")
            print(f"   响应时间: {end_time - start_time:.2f}秒")
            
            if response.status_code == 200:
                result = response.json()
                print(f"   回答长度: {len(result.get('answer', ''))}")
                print(f"   相关文档数: {len(result.get('relevant_docs', []))}")
                print(f"   对话ID: {result.get('conversation_id', 'N/A')}")
                print(f"   处理时间: {result.get('processing_time', 0):.2f}秒")
                print("   ✅ 查询成功")
                
                # 显示部分回答
                answer = result.get('answer', '')
                if answer:
                    print(f"   回答预览: {answer[:100]}...")
                
            else:
                print(f"   ❌ 查询失败: {response.text}")
                
        except Exception as e:
            print(f"   ❌ 查询异常: {e}")
        
        print()
    
    print("=" * 50)
    print("🎉 RAG API测试完成")

if __name__ == "__main__":
    test_rag_api()