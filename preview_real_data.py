#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
预览真实数据
"""

import os
import json

def preview_real_graduates():
    """预览真实毕业生数据"""
    print("=" * 60)
    print("👥 真实毕业生数据预览")
    print("=" * 60)
    
    csv_file = "data/real_graduates.csv"
    if not os.path.exists(csv_file):
        print(f"❌ 文件不存在: {csv_file}")
        return
    
    try:
        with open(csv_file, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        
        print(f"📊 数据统计:")
        print(f"   总行数: {len(lines)}")
        print(f"   表头: {lines[0].strip()}")
        print(f"   数据行数: {len(lines) - 1}")
        
        print(f"\n📋 前5个毕业生:")
        for i, line in enumerate(lines[1:6], 1):
            if line.strip():
                fields = line.strip().split(',')
                if len(fields) >= 7:
                    name = fields[0]
                    location = fields[2]
                    gpa = fields[3]
                    direction = fields[4]
                    company = fields[5]
                    salary = fields[6]
                    print(f"   {i}. {name} - {location} - GPA:{gpa} - {direction}")
                    print(f"      就业: {company} - 年薪: {salary}")
        
        print(f"\n📈 数据概览:")
        # 统计GPA分布
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
            print(f"   GPA范围: {min(gpas):.2f} - {max(gpas):.2f}")
            print(f"   平均GPA: {sum(gpas)/len(gpas):.2f}")
        
        # 统计就业公司
        company_counts = {}
        for company in companies:
            company_counts[company] = company_counts.get(company, 0) + 1
        
        print(f"   就业公司数量: {len(company_counts)}")
        print(f"   主要就业公司:")
        for company, count in sorted(company_counts.items(), key=lambda x: x[1], reverse=True)[:5]:
            print(f"     {company}: {count}人")
            
    except Exception as e:
        print(f"❌ 读取失败: {e}")

def preview_real_cultivation_plan():
    """预览真实培养方案"""
    print("\n" + "=" * 60)
    print("📚 真实培养方案预览")
    print("=" * 60)
    
    txt_file = "data/real_cultivation_plan.txt"
    if not os.path.exists(txt_file):
        print(f"❌ 文件不存在: {txt_file}")
        return
    
    try:
        with open(txt_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        print(f"📊 文档统计:")
        print(f"   总字符数: {len(content)}")
        print(f"   总行数: {len(content.split(chr(10)))}")
        
        # 分析主要章节
        lines = content.split('\n')
        print(f"\n📖 主要章节:")
        for line in lines:
            if line.strip() and ('、' in line or '：' in line or ':' in line):
                if len(line.strip()) < 100 and any(keyword in line for keyword in ['专业', '培养', '课程', '实践', '就业', '毕业']):
                    print(f"   - {line.strip()}")
        
        # 关键词统计
        keywords = ['学分', '课程', '实践', '就业', '毕业', '微电子', '集成电路', '半导体']
        print(f"\n🔍 关键词统计:")
        for keyword in keywords:
            count = content.count(keyword)
            if count > 0:
                print(f"   '{keyword}': {count}次")
        
        # 显示核心课程部分
        print(f"\n📝 核心课程预览:")
        core_course_section = ""
        for i, line in enumerate(lines):
            if '专业核心课' in line or '核心课程' in line:
                # 显示接下来的几行
                for j in range(i, min(i+10, len(lines))):
                    if lines[j].strip():
                        core_course_section += lines[j] + "\n"
                break
        
        if core_course_section:
            print(core_course_section[:500] + "...")
        else:
            print("   未找到核心课程部分")
            
    except Exception as e:
        print(f"❌ 读取失败: {e}")

def compare_data():
    """比较演示数据和真实数据"""
    print("\n" + "=" * 60)
    print("🔄 数据对比")
    print("=" * 60)
    
    # 检查文件大小
    files = [
        ("演示毕业生数据", "data/students.csv"),
        ("真实毕业生数据", "data/real_graduates.csv"),
        ("演示培养方案", "data/cultivation_plan.txt"),
        ("真实培养方案", "data/real_cultivation_plan.txt")
    ]
    
    for name, path in files:
        if os.path.exists(path):
            size = os.path.getsize(path)
            print(f"   {name}: {size} bytes ({size/1024:.1f} KB)")
        else:
            print(f"   {name}: 不存在")
    
    print(f"\n💡 建议:")
    print(f"   1. 真实数据比演示数据更丰富和详细")
    print(f"   2. 真实毕业生数据包含20个真实案例")
    print(f"   3. 真实培养方案是微电子专业的完整方案")
    print(f"   4. 建议使用真实数据进行RAG系统演示")

if __name__ == "__main__":
    preview_real_graduates()
    preview_real_cultivation_plan()
    compare_data()
    
    print("\n" + "=" * 60)
    print("✅ 数据预览完成")
    print("=" * 60) 