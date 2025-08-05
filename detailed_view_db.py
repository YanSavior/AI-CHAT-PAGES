#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
详细查看向量数据库内容
"""

import os
import json
import chromadb

def view_detailed_database():
    """详细查看向量数据库内容"""
    
    print("🔍 详细查看向量数据库...")
    
    # 连接向量数据库
    try:
        client = chromadb.PersistentClient(path="./vector_db")
        print("✅ 成功连接到向量数据库")
    except Exception as e:
        print(f"❌ 连接失败: {e}")
        return
    
    # 获取集合
    collections = client.list_collections()
    if not collections:
        print("⚠️  没有找到任何集合")
        return
    
    collection = collections[0]
    print(f"\n📊 集合信息: {collection.name}")
    
    try:
        # 获取所有数据
        all_data = collection.get()
        count = len(all_data['documents'])
        print(f"文档总数: {count}")
        
        # 按类型分组显示
        student_docs = []
        plan_docs = []
        
        for i, metadata in enumerate(all_data['metadatas']):
            doc_info = {
                'id': all_data['ids'][i],
                'content': all_data['documents'][i],
                'metadata': metadata
            }
            
            if metadata.get('type') == 'student':
                student_docs.append(doc_info)
            elif metadata.get('type') == 'cultivation_plan':
                plan_docs.append(doc_info)
        
        # 显示学生文档
        print(f"\n👨‍🎓 学生文档 ({len(student_docs)} 个):")
        print("=" * 80)
        for i, doc in enumerate(student_docs):
            print(f"\n学生 {i+1}:")
            print(f"ID: {doc['id']}")
            print(f"姓名: {doc['metadata']['name']}")
            print(f"专业: {doc['metadata']['major']}")
            print(f"学号: {doc['metadata']['student_id']}")
            print(f"描述: {doc['content']}")
        
        # 显示培养方案文档
        print(f"\n📚 培养方案文档 ({len(plan_docs)} 个):")
        print("=" * 80)
        for i, doc in enumerate(plan_docs):
            print(f"\n方案部分 {i+1}:")
            print(f"ID: {doc['id']}")
            print(f"部分: {doc['metadata']['section_name']}")
            print(f"内容: {doc['content'][:300]}...")
        
        # 统计信息
        print(f"\n📈 详细统计:")
        print(f"  - 学生文档: {len(student_docs)} 个")
        print(f"  - 培养方案文档: {len(plan_docs)} 个")
        print(f"  - 总文档数: {count} 个")
        
        # 学生就业统计
        employed_count = 0
        unemployed_count = 0
        for doc in student_docs:
            if "已就业" in doc['content']:
                employed_count += 1
            else:
                unemployed_count += 1
        
        print(f"\n🎯 学生就业统计:")
        print(f"  - 已就业: {employed_count} 人")
        print(f"  - 待业: {unemployed_count} 人")
        print(f"  - 就业率: {employed_count/(employed_count+unemployed_count)*100:.1f}%")
        
    except Exception as e:
        print(f"❌ 获取数据失败: {e}")

def main():
    """主函数"""
    print("=" * 80)
    print("向量数据库详细查看工具")
    print("=" * 80)
    
    view_detailed_database()

if __name__ == "__main__":
    main() 