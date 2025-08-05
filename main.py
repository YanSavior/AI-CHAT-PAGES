#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
RAG系统主程序
演示完整的检索增强生成流程
"""

import os
import sys
from rag_system import RAGSystem

def main():
    """主程序"""
    print("=" * 60)
    print("🚀 RAG系统演示程序")
    print("=" * 60)
    
    # 初始化RAG系统
    print("\n1. 初始化RAG系统...")
    rag = RAGSystem()
    
    # 检查数据文件
    student_csv = "data/students.csv"
    plan_txt = "data/cultivation_plan.txt"
    
    if not os.path.exists(student_csv):
        print(f"❌ 学生数据文件不存在: {student_csv}")
        return
    
    if not os.path.exists(plan_txt):
        print(f"❌ 培养方案文件不存在: {plan_txt}")
        return
    
    # 构建知识库
    print("\n2. 构建知识库...")
    rag.build_knowledge_base(student_csv, plan_txt)
    
    # 获取知识库信息
    print("\n3. 知识库信息:")
    info = rag.get_knowledge_base_info()
    print(f"   集合名称: {info.get('name', 'N/A')}")
    print(f"   文档数量: {info.get('document_count', 0)}")
    
    # 测试查询
    print("\n4. 开始测试查询...")
    test_questions = [
        "计算机专业的学生就业情况如何？",
        "需要修多少学分才能毕业？",
        "GPA高的学生一般去哪里工作？",
        "软件工程专业的课程设置是什么？",
        "人工智能专业的学生就业前景怎么样？",
        "计算机专业需要学习哪些核心课程？",
        "毕业要求有哪些？",
        "数据科学专业的学生就业方向有哪些？"
    ]
    
    for i, question in enumerate(test_questions, 1):
        print(f"\n--- 测试查询 {i} ---")
        print(f"问题: {question}")
        
        try:
            # 执行RAG查询
            result = rag.query(question)
            
            print(f"回答: {result['answer']}")
            print(f"相关文档数量: {len(result['relevant_docs'])}")
            
            # 显示相关文档
            for j, doc in enumerate(result['relevant_docs'], 1):
                print(f"  文档{j}: {doc[:100]}...")
                if j < len(result['scores']):
                    print(f"    相似度分数: {result['scores'][j-1]:.4f}")
            
        except Exception as e:
            print(f"❌ 查询失败: {e}")
    
    # 交互式查询
    print("\n" + "=" * 60)
    print("🎯 交互式查询模式")
    print("输入 'quit' 退出")
    print("=" * 60)
    
    while True:
        try:
            question = input("\n请输入您的问题: ").strip()
            
            if question.lower() in ['quit', 'exit', '退出']:
                print("👋 再见！")
                break
            
            if not question:
                continue
            
            print("🔍 正在查询...")
            result = rag.query(question)
            
            print(f"\n📝 回答:")
            print(result['answer'])
            
            print(f"\n📚 相关文档 ({len(result['relevant_docs'])} 个):")
            for i, doc in enumerate(result['relevant_docs'], 1):
                print(f"  {i}. {doc}")
                if i < len(result['scores']):
                    print(f"     相似度: {result['scores'][i-1]:.4f}")
            
        except KeyboardInterrupt:
            print("\n👋 再见！")
            break
        except Exception as e:
            print(f"❌ 查询出错: {e}")

def demo_advanced_features():
    """演示高级功能"""
    print("\n" + "=" * 60)
    print("🔧 高级功能演示")
    print("=" * 60)
    
    rag = RAGSystem()
    
    # 演示相似文档搜索
    print("\n1. 相似文档搜索演示:")
    search_query = "计算机专业"
    results = rag.search_similar_documents(search_query, n_results=3)
    
    print(f"搜索查询: {search_query}")
    for i, doc in enumerate(results['documents'][0], 1):
        print(f"  {i}. {doc[:100]}...")
    
    # 演示知识库管理
    print("\n2. 知识库管理演示:")
    collections = rag.list_knowledge_bases()
    print(f"现有知识库: {collections}")
    
    # 导出知识库
    print("\n3. 导出知识库:")
    export_path = "knowledge_base_export.json"
    rag.export_knowledge_base(export_path)
    print(f"知识库已导出到: {export_path}")

if __name__ == "__main__":
    try:
        main()
        
        # 询问是否演示高级功能
        response = input("\n是否演示高级功能？(y/n): ").strip().lower()
        if response in ['y', 'yes', '是']:
            demo_advanced_features()
            
    except Exception as e:
        print(f"❌ 程序运行出错: {e}")
        sys.exit(1) 