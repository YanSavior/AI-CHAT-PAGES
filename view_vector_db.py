#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
查看向量数据库内容
构建知识库并展示向量化后的数据
"""

import os
import json
from rag_system import RAGSystem

def build_and_view_knowledge_base():
    """构建知识库并查看内容"""
    
    print("🚀 开始构建知识库...")
    
    # 初始化RAG系统
    rag_system = RAGSystem(
        bi_encoder_model="D:/bge_models/bge-small-zh-v1.5",
        cross_encoder_model="D:/bge_models/bge-reranker-v2-m3"
    )
    
    # 构建知识库
    print("🔨 构建知识库...")
    rag_system.build_knowledge_base(
        student_csv="data/students.csv",
        plan_txt="data/cultivation_plan.txt"
    )
    
    # 获取知识库信息
    print("\n📊 知识库信息:")
    collection_info = rag_system.vector_db.get_collection_info()
    print(json.dumps(collection_info, ensure_ascii=False, indent=2))
    
    # 列出所有集合
    print("\n📁 所有集合:")
    collections = rag_system.vector_db.list_collections()
    for col in collections:
        print(f"  - {col}")
    
    # 测试查询
    print("\n🔍 测试查询:")
    test_questions = [
        "计算机科学与技术专业的培养目标是什么？",
        "张三的就业情况如何？",
        "有哪些核心课程？",
        "毕业生的就业方向有哪些？"
    ]
    
    for question in test_questions:
        print(f"\n问题: {question}")
        try:
            result = rag_system.query(question=question, top_k_retrieve=3, top_k_final=2)
            print(f"答案: {result['answer']}")
            print("相关文档:")
            for i, doc in enumerate(result['relevant_docs']):
                print(f"  {i+1}. {doc[:100]}...")
        except Exception as e:
            print(f"查询失败: {e}")
    
    # 查看向量数据库的原始数据
    print("\n📋 向量数据库原始数据:")
    try:
        # 获取集合中的所有数据
        all_data = rag_system.vector_db.collection.get()
        
        print(f"文档总数: {len(all_data['documents'])}")
        print("\n前5个文档:")
        for i in range(min(5, len(all_data['documents']))):
            print(f"\n文档 {i+1}:")
            print(f"ID: {all_data['ids'][i]}")
            print(f"内容: {all_data['documents'][i][:200]}...")
            print(f"元数据: {all_data['metadatas'][i]}")
            print(f"向量维度: {len(all_data['embeddings'][i])}")
            
    except Exception as e:
        print(f"获取原始数据失败: {e}")

def main():
    """主函数"""
    print("=" * 60)
    print("向量数据库查看工具")
    print("=" * 60)
    
    build_and_view_knowledge_base()

if __name__ == "__main__":
    main() 