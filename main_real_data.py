#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
RAG系统主程序 - 使用真实数据
演示完整的检索增强生成流程
"""

import os
import sys
from rag_system.rag_system import RAGSystem

def main():
    """主程序"""
    print("=" * 60)
    print("🚀 RAG系统演示程序 - 真实数据版本")
    print("=" * 60)
    
    # 初始化RAG系统
    print("\n1. 初始化RAG系统...")
    rag = RAGSystem()
    
    # 检查真实数据文件
    student_csv = "data/real_graduates.csv"
    plan_txt = "data/real_cultivation_plan.txt"
    
    if not os.path.exists(student_csv):
        print(f"❌ 真实毕业生数据文件不存在: {student_csv}")
        return
    
    if not os.path.exists(plan_txt):
        print(f"❌ 真实培养方案文件不存在: {plan_txt}")
        return
    
    # 构建知识库
    print("\n2. 构建知识库（使用真实数据）...")
    rag.build_knowledge_base(student_csv, plan_txt)
    
    # 获取知识库信息
    print("\n3. 知识库信息:")
    info = rag.get_knowledge_base_info()
    print(f"   集合名称: {info.get('name', 'N/A')}")
    print(f"   文档数量: {info.get('document_count', 0)}")
    
    # 测试查询 - 针对真实数据的查询
    print("\n4. 开始测试查询（基于真实数据）...")
    test_questions = [
        "微电子专业的毕业生就业情况如何？",
        "需要修多少学分才能毕业？",
        "GPA高的学生一般去哪里工作？",
        "微电子专业的核心课程有哪些？",
        "微电子专业的学生就业前景怎么样？",
        "微电子专业需要学习哪些专业课程？",
        "毕业要求有哪些？",
        "微电子专业的就业方向有哪些？",
        "哪些公司招聘微电子专业的学生？",
        "微电子专业的实践环节有哪些？"
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
    print("🎯 交互式查询模式 - 真实数据")
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

def show_real_data_info():
    """显示真实数据信息"""
    print("\n" + "=" * 60)
    print("📊 真实数据信息")
    print("=" * 60)
    
    # 显示毕业生数据统计
    print("\n👥 毕业生数据统计:")
    try:
        import pandas as pd
        df = pd.read_csv("data/real_graduates.csv")
        print(f"   总人数: {len(df)} 人")
        print(f"   平均GPA: {df['GPA'].mean():.2f}")
        print(f"   最高GPA: {df['GPA'].max():.2f}")
        print(f"   最低GPA: {df['GPA'].min():.2f}")
        
        # 就业去向统计
        print(f"\n🏢 就业去向分布:")
        employment_counts = df['就业去向'].value_counts()
        for company, count in employment_counts.head(10).items():
            print(f"   {company}: {count} 人")
        
        # 年薪统计
        print(f"\n💰 年薪分布:")
        salary_data = df[df['年薪'] != '在读'][df['年薪'] != '项目孵化期'][df['年薪'] != '津贴制'][df['年薪'] != '奖学金']
        if not salary_data.empty:
            salary_values = salary_data['年薪'].str.replace(',', '').astype(int)
            print(f"   平均年薪: {salary_values.mean():,.0f} 元")
            print(f"   最高年薪: {salary_values.max():,.0f} 元")
            print(f"   最低年薪: {salary_values.min():,.0f} 元")
        
    except Exception as e:
        print(f"   ❌ 读取数据失败: {e}")
    
    # 显示培养方案信息
    print(f"\n📚 培养方案信息:")
    try:
        with open("data/real_cultivation_plan.txt", 'r', encoding='utf-8') as f:
            content = f.read()
            print(f"   文档长度: {len(content)} 字符")
            print(f"   行数: {len(content.split(chr(10)))} 行")
            
            # 统计关键词
            keywords = ['学分', '课程', '实践', '就业', '毕业']
            for keyword in keywords:
                count = content.count(keyword)
                print(f"   '{keyword}' 出现次数: {count}")
                
    except Exception as e:
        print(f"   ❌ 读取培养方案失败: {e}")

def demo_advanced_features():
    """演示高级功能"""
    print("\n" + "=" * 60)
    print("🔧 高级功能演示 - 真实数据")
    print("=" * 60)
    
    rag = RAGSystem()
    
    # 演示相似文档搜索
    print("\n1. 相似文档搜索演示:")
    search_queries = [
        "微电子专业",
        "集成电路",
        "就业",
        "课程"
    ]
    
    for query in search_queries:
        print(f"\n搜索查询: {query}")
        try:
            results = rag.search_similar_documents(query, n_results=3)
            for i, doc in enumerate(results['documents'][0], 1):
                print(f"  {i}. {doc[:100]}...")
        except Exception as e:
            print(f"  ❌ 搜索失败: {e}")
    
    # 演示知识库管理
    print("\n2. 知识库管理演示:")
    collections = rag.list_knowledge_bases()
    print(f"现有知识库: {collections}")
    
    # 导出知识库
    print("\n3. 导出知识库:")
    export_path = "real_knowledge_base_export.json"
    try:
        rag.export_knowledge_base(export_path)
        print(f"知识库已导出到: {export_path}")
    except Exception as e:
        print(f"❌ 导出失败: {e}")

if __name__ == "__main__":
    try:
        show_real_data_info()
        main()
        
        # 询问是否演示高级功能
        response = input("\n是否演示高级功能？(y/n): ").strip().lower()
        if response in ['y', 'yes', '是']:
            demo_advanced_features()
            
    except Exception as e:
        print(f"❌ 程序运行出错: {e}")
        sys.exit(1) 