#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
检查RAG系统数据库状态
"""

import os
import sys
from rag_system.rag_system import RAGSystem

def check_database():
    """检查数据库状态"""
    print("🔍 检查RAG系统数据库状态")
    print("=" * 50)
    
    # 检查向量数据库目录
    vector_db_dir = "./vector_db"
    if os.path.exists(vector_db_dir):
        print(f"✅ 向量数据库目录存在: {vector_db_dir}")
        
        # 列出目录内容
        try:
            files = os.listdir(vector_db_dir)
            print(f"📁 数据库文件数量: {len(files)}")
            for file in files:
                file_path = os.path.join(vector_db_dir, file)
                size = os.path.getsize(file_path)
                print(f"   - {file} ({size} bytes)")
        except Exception as e:
            print(f"❌ 无法读取数据库目录: {e}")
    else:
        print(f"❌ 向量数据库目录不存在: {vector_db_dir}")
    
    # 初始化RAG系统
    print("\n🚀 初始化RAG系统...")
    try:
        rag = RAGSystem()
        
        # 检查知识库列表
        print("\n📚 知识库列表:")
        collections = rag.list_knowledge_bases()
        if collections:
            for collection in collections:
                print(f"   - {collection}")
        else:
            print("   (暂无知识库)")
        
        # 检查默认知识库信息
        print("\n📊 默认知识库信息:")
        try:
            info = rag.get_knowledge_base_info()
            if "error" not in info:
                print(f"   名称: {info.get('name', 'N/A')}")
                print(f"   文档数量: {info.get('document_count', 0)}")
                print(f"   元数据: {info.get('metadata', {})}")
            else:
                print(f"   {info['error']}")
        except Exception as e:
            print(f"   ❌ 获取信息失败: {e}")
        
        # 检查数据文件
        print("\n📄 数据文件检查:")
        data_files = [
            ("学生数据", "data/students.csv"),
            ("培养方案", "data/cultivation_plan.txt")
        ]
        
        for name, path in data_files:
            if os.path.exists(path):
                size = os.path.getsize(path)
                print(f"   ✅ {name}: {path} ({size} bytes)")
            else:
                print(f"   ❌ {name}: {path} (不存在)")
        
        # 尝试构建知识库
        print("\n🔧 尝试构建知识库...")
        try:
            rag.build_knowledge_base("data/students.csv", "data/cultivation_plan.txt")
            
            # 重新检查知识库信息
            print("\n📊 构建后知识库信息:")
            info = rag.get_knowledge_base_info()
            if "error" not in info:
                print(f"   名称: {info.get('name', 'N/A')}")
                print(f"   文档数量: {info.get('document_count', 0)}")
                print(f"   元数据: {info.get('metadata', {})}")
            else:
                print(f"   {info['error']}")
                
        except Exception as e:
            print(f"   ❌ 构建知识库失败: {e}")
        
        # 测试查询
        print("\n🧪 测试查询...")
        try:
            result = rag.query("计算机专业")
            print(f"   ✅ 查询成功，返回 {len(result['relevant_docs'])} 个相关文档")
            print(f"   回答: {result['answer'][:100]}...")
        except Exception as e:
            print(f"   ❌ 查询失败: {e}")
            
    except Exception as e:
        print(f"❌ 初始化RAG系统失败: {e}")

def show_database_details():
    """显示数据库详细信息"""
    print("\n" + "=" * 50)
    print("📋 数据库详细信息")
    print("=" * 50)
    
    try:
        rag = RAGSystem()
        
        # 获取所有集合
        collections = rag.list_knowledge_bases()
        
        for collection_name in collections:
            print(f"\n📚 知识库: {collection_name}")
            
            # 获取集合信息
            info = rag.get_knowledge_base_info(collection_name)
            if "error" not in info:
                print(f"   文档数量: {info.get('document_count', 0)}")
                print(f"   元数据: {info.get('metadata', {})}")
                
                # 搜索示例
                try:
                    results = rag.search_similar_documents("计算机", n_results=3, collection_name=collection_name)
                    print(f"   示例搜索结果: {len(results['documents'][0])} 个文档")
                except Exception as e:
                    print(f"   搜索失败: {e}")
            else:
                print(f"   {info['error']}")
                
    except Exception as e:
        print(f"❌ 获取详细信息失败: {e}")

if __name__ == "__main__":
    check_database()
    show_database_details()
    
    print("\n" + "=" * 50)
    print("✅ 数据库检查完成")
    print("=" * 50) 