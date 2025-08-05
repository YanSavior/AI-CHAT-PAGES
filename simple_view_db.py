#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
简单查看向量数据库内容
"""

import os
import json
import chromadb

def view_vector_database():
    """查看向量数据库内容"""
    
    print("🔍 查看向量数据库...")
    
    # 连接向量数据库
    try:
        client = chromadb.PersistentClient(path="./vector_db")
        print("✅ 成功连接到向量数据库")
    except Exception as e:
        print(f"❌ 连接失败: {e}")
        return
    
    # 列出所有集合
    print("\n📁 所有集合:")
    collections = client.list_collections()
    for col in collections:
        print(f"  - {col.name}")
    
    if not collections:
        print("⚠️  没有找到任何集合")
        return
    
    # 查看第一个集合的内容
    collection = collections[0]
    print(f"\n📊 集合信息: {collection.name}")
    
    try:
        # 获取集合信息
        count = collection.count()
        print(f"文档总数: {count}")
        
        if count > 0:
            # 获取所有数据
            all_data = collection.get()
            
            print(f"\n📋 前5个文档:")
            for i in range(min(5, len(all_data['documents']))):
                print(f"\n文档 {i+1}:")
                print(f"ID: {all_data['ids'][i]}")
                print(f"内容: {all_data['documents'][i][:200]}...")
                print(f"元数据: {all_data['metadatas'][i]}")
                if 'embeddings' in all_data and all_data['embeddings']:
                    print(f"向量维度: {len(all_data['embeddings'][i])}")
                else:
                    print("向量数据: 未显示")
            
            # 统计文档类型
            print(f"\n📈 文档类型统计:")
            type_count = {}
            for metadata in all_data['metadatas']:
                doc_type = metadata.get('type', 'unknown')
                type_count[doc_type] = type_count.get(doc_type, 0) + 1
            
            for doc_type, count in type_count.items():
                print(f"  - {doc_type}: {count} 个")
                
    except Exception as e:
        print(f"❌ 获取数据失败: {e}")

def main():
    """主函数"""
    print("=" * 50)
    print("向量数据库查看工具")
    print("=" * 50)
    
    view_vector_database()

if __name__ == "__main__":
    main() 