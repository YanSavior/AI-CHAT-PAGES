#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
完整数据预览 - 包含所有培养方案和毕业生数据
"""

import os
import json

def preview_complete_dataset():
    """预览完整数据集"""
    print("=" * 70)
    print("📊 完整数据集预览")
    print("=" * 70)
    
    # 1. 毕业生数据
    print("\n👥 毕业生数据:")
    graduate_file = "data/real_graduates.csv"
    if os.path.exists(graduate_file):
        with open(graduate_file, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        print(f"   📁 文件: {graduate_file}")
        print(f"   📊 总人数: {len(lines) - 1} 人")
        print(f"   📝 数据行: {len(lines)} 行")
        
        # 显示前3个毕业生
        print("   📋 示例数据:")
        for i, line in enumerate(lines[1:4], 1):
            if line.strip():
                fields = line.strip().split(',')
                if len(fields) >= 7:
                    name = fields[0]
                    gpa = fields[3]
                    company = fields[5]
                    salary = fields[6]
                    print(f"     {i}. {name} - GPA:{gpa} - {company} - {salary}")
    else:
        print("   ❌ 文件不存在")
    
    # 2. 培养方案数据
    print("\n📚 培养方案数据:")
    config_file = "data/cultivation_plans_config.json"
    if os.path.exists(config_file):
        with open(config_file, 'r', encoding='utf-8') as f:
            config = json.load(f)
        
        print(f"   📁 配置文件: {config_file}")
        print(f"   📊 总专业数: {config['total_plans']} 个")
        print(f"   📝 总字符数: {config['total_chars']:,}")
        print(f"   📄 总行数: {config['total_lines']:,}")
        
        print("   🎓 专业列表:")
        for i, plan in enumerate(config['cultivation_plans'], 1):
            print(f"     {i}. {plan['name']}")
            print(f"        文件: {plan['file']}")
            print(f"        字符: {plan['char_count']:,}")
            print(f"        行数: {plan['line_count']}")
    else:
        print("   ❌ 配置文件不存在")
    
    # 3. 合并的培养方案文件
    print("\n📖 合并培养方案文件:")
    combined_file = "data/all_cultivation_plans.txt"
    if os.path.exists(combined_file):
        size = os.path.getsize(combined_file)
        print(f"   📁 文件: {combined_file}")
        print(f"   📊 文件大小: {size:,} bytes ({size/1024:.1f} KB)")
        
        # 读取前几行显示内容
        with open(combined_file, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        print(f"   📝 总行数: {len(lines)}")
        print("   📋 文件开头:")
        for i, line in enumerate(lines[:5]):
            print(f"     {i+1}: {line.strip()}")
    else:
        print("   ❌ 文件不存在")
    
    # 4. 数据统计
    print("\n📈 数据统计:")
    
    # 毕业生统计
    if os.path.exists(graduate_file):
        with open(graduate_file, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        gpas = []
        companies = []
        for line in lines[1:]:
            if line.strip():
                fields = line.strip().split(',')
                if len(fields) >= 4:
                    try:
                        gpa = float(fields[3])
                        gpas.append(gpa)
                    except:
                        pass
                    if len(fields) >= 6:
                        companies.append(fields[5])
        
        if gpas:
            print(f"   🎓 毕业生GPA统计:")
            print(f"     平均GPA: {sum(gpas)/len(gpas):.2f}")
            print(f"     GPA范围: {min(gpas):.2f} - {max(gpas):.2f}")
        
        print(f"   🏢 就业公司数量: {len(set(companies))}")
    
    # 培养方案统计
    if os.path.exists(config_file):
        with open(config_file, 'r', encoding='utf-8') as f:
            config = json.load(f)
        
        print(f"   📚 培养方案统计:")
        print(f"     平均字符数: {config['total_chars']//config['total_plans']:,}")
        print(f"     平均行数: {config['total_lines']//config['total_plans']}")
        
        # 按字符数排序
        sorted_plans = sorted(config['cultivation_plans'], 
                            key=lambda x: x['char_count'], reverse=True)
        print(f"   📊 最大培养方案: {sorted_plans[0]['name']} ({sorted_plans[0]['char_count']:,} 字符)")
        print(f"   📊 最小培养方案: {sorted_plans[-1]['name']} ({sorted_plans[-1]['char_count']:,} 字符)")
    
    # 5. RAG系统适用性分析
    print("\n🤖 RAG系统适用性分析:")
    print("   ✅ 数据丰富度: 高")
    print("   ✅ 数据多样性: 高")
    print("   ✅ 结构化程度: 中等")
    print("   ✅ 语义相关性: 高")
    print("   ✅ 查询潜力: 高")
    
    print("\n💡 建议的RAG查询类型:")
    print("   1. 专业对比查询")
    print("   2. 课程信息查询")
    print("   3. 就业方向查询")
    print("   4. 学分要求查询")
    print("   5. 实践环节查询")
    print("   6. 毕业生就业情况查询")
    print("   7. 专业特色查询")
    print("   8. 培养目标查询")

def show_sample_queries():
    """显示示例查询"""
    print("\n" + "=" * 70)
    print("🔍 示例查询建议")
    print("=" * 70)
    
    queries = [
        "微电子专业和集成电路专业有什么区别？",
        "哪些专业的就业前景比较好？",
        "机械设计制造及其自动化专业需要修多少学分？",
        "智能制造工程专业的核心课程有哪些？",
        "微电子专业的毕业生一般去哪里工作？",
        "哪些专业有辅修和二学位选项？",
        "集成电路相关专业有哪些？",
        "各专业的实践环节有什么不同？",
        "GPA高的学生一般选择什么专业？",
        "哪些公司招聘微电子和集成电路专业的学生？",
        "微电子英才班和普通班有什么区别？",
        "各专业的培养目标是什么？",
        "哪些专业更注重实践能力？",
        "毕业要求有哪些共同点？",
        "各专业的就业方向有什么差异？"
    ]
    
    for i, query in enumerate(queries, 1):
        print(f"   {i:2d}. {query}")

def show_rag_workflow():
    """显示RAG工作流程"""
    print("\n" + "=" * 70)
    print("🔄 RAG系统工作流程")
    print("=" * 70)
    
    steps = [
        ("1. 数据预处理", "将CSV和TXT文件转换为结构化文本"),
        ("2. 文本分块", "将长文档分割成语义连贯的小块"),
        ("3. 向量化", "使用BGE模型将文本转换为向量"),
        ("4. 存储", "将向量存储到ChromaDB中"),
        ("5. 查询处理", "将用户问题转换为查询向量"),
        ("6. 相似度检索", "在向量数据库中检索相似文档"),
        ("7. 重排序", "使用Cross-Encoder对结果重新排序"),
        ("8. 答案生成", "基于检索到的文档生成答案")
    ]
    
    for step, description in steps:
        print(f"   {step}: {description}")

if __name__ == "__main__":
    preview_complete_dataset()
    show_sample_queries()
    show_rag_workflow()
    
    print("\n" + "=" * 70)
    print("✅ 完整数据预览完成")
    print("=" * 70) 