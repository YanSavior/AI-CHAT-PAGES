#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
处理所有培养方案文件
"""

import os
import json
import re

def extract_profession_name(text):
    """从文本中提取专业名称"""
    # 匹配专业名称的模式
    patterns = [
        r'([^专业培养方案]+专业)培养方案',
        r'([^英才班]+英才班)专业培养方案',
        r'([^专业]+专业)'
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text)
        if match:
            return match.group(1).strip()
    
    return "未知专业"

def process_cultivation_plan_file(file_path):
    """处理单个培养方案文件"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # 合并所有文本段落
        full_text = '\n'.join(data)
        
        # 提取专业名称
        profession_name = extract_profession_name(full_text)
        
        # 统计信息
        char_count = len(full_text)
        line_count = len(full_text.split('\n'))
        
        # 关键词统计
        keywords = ['学分', '课程', '实践', '就业', '毕业', '专业', '培养', '设计', '工程']
        keyword_counts = {}
        for keyword in keywords:
            count = full_text.count(keyword)
            if count > 0:
                keyword_counts[keyword] = count
        
        return {
            'file_name': os.path.basename(file_path),
            'profession_name': profession_name,
            'char_count': char_count,
            'line_count': line_count,
            'keyword_counts': keyword_counts,
            'content': full_text
        }
        
    except Exception as e:
        print(f"❌ 处理文件 {file_path} 失败: {e}")
        return None

def save_cultivation_plan_to_txt(plan_data, output_dir="data"):
    """将培养方案保存为txt文件"""
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    
    # 清理文件名
    safe_name = re.sub(r'[^\w\s-]', '', plan_data['profession_name'])
    safe_name = re.sub(r'[-\s]+', '_', safe_name)
    
    file_path = os.path.join(output_dir, f"{safe_name}_培养方案.txt")
    
    try:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(f"# {plan_data['profession_name']}专业培养方案\n\n")
            f.write(plan_data['content'])
        
        return file_path
    except Exception as e:
        print(f"❌ 保存文件失败: {e}")
        return None

def main():
    """主函数"""
    print("=" * 60)
    print("📚 处理所有培养方案文件")
    print("=" * 60)
    
    # 培养方案目录
    plan_dir = "培养方案"
    if not os.path.exists(plan_dir):
        print(f"❌ 培养方案目录不存在: {plan_dir}")
        return
    
    # 获取所有JSON文件
    json_files = [f for f in os.listdir(plan_dir) if f.endswith('.json')]
    print(f"📁 找到 {len(json_files)} 个培养方案文件")
    
    # 处理每个文件
    processed_plans = []
    for file_name in json_files:
        file_path = os.path.join(plan_dir, file_name)
        print(f"\n🔍 处理文件: {file_name}")
        
        plan_data = process_cultivation_plan_file(file_path)
        if plan_data:
            processed_plans.append(plan_data)
            print(f"   ✅ 专业: {plan_data['profession_name']}")
            print(f"   📊 字符数: {plan_data['char_count']}")
            print(f"   📝 行数: {plan_data['line_count']}")
            
            # 保存为txt文件
            txt_path = save_cultivation_plan_to_txt(plan_data)
            if txt_path:
                print(f"   💾 已保存: {txt_path}")
    
    # 生成汇总报告
    print("\n" + "=" * 60)
    print("📋 培养方案汇总报告")
    print("=" * 60)
    
    print(f"\n📊 总体统计:")
    print(f"   总文件数: {len(processed_plans)}")
    total_chars = sum(p['char_count'] for p in processed_plans)
    total_lines = sum(p['line_count'] for p in processed_plans)
    print(f"   总字符数: {total_chars:,}")
    print(f"   总行数: {total_lines:,}")
    
    print(f"\n🎓 专业列表:")
    for i, plan in enumerate(processed_plans, 1):
        print(f"   {i}. {plan['profession_name']}")
    
    # 关键词统计
    print(f"\n🔍 关键词统计:")
    all_keywords = {}
    for plan in processed_plans:
        for keyword, count in plan['keyword_counts'].items():
            all_keywords[keyword] = all_keywords.get(keyword, 0) + count
    
    for keyword, count in sorted(all_keywords.items(), key=lambda x: x[1], reverse=True):
        print(f"   '{keyword}': {count}次")
    
    # 生成合并的培养方案文件
    print(f"\n📝 生成合并的培养方案文件...")
    combined_path = os.path.join("data", "all_cultivation_plans.txt")
    try:
        with open(combined_path, 'w', encoding='utf-8') as f:
            f.write("# 所有专业培养方案汇总\n\n")
            f.write(f"共包含 {len(processed_plans)} 个专业的培养方案\n")
            f.write(f"总字符数: {total_chars:,}\n")
            f.write(f"总行数: {total_lines:,}\n\n")
            f.write("=" * 50 + "\n\n")
            
            for plan in processed_plans:
                f.write(f"## {plan['profession_name']}专业培养方案\n\n")
                f.write(plan['content'])
                f.write("\n\n" + "=" * 50 + "\n\n")
        
        print(f"   ✅ 合并文件已保存: {combined_path}")
        
    except Exception as e:
        print(f"   ❌ 生成合并文件失败: {e}")
    
    # 生成RAG系统配置文件
    print(f"\n⚙️ 生成RAG系统配置文件...")
    config_data = {
        "cultivation_plans": [
            {
                "name": plan['profession_name'],
                "file": f"{re.sub(r'[^\w\s-]', '', plan['profession_name']).replace(' ', '_')}_培养方案.txt",
                "char_count": plan['char_count'],
                "line_count": plan['line_count']
            }
            for plan in processed_plans
        ],
        "total_plans": len(processed_plans),
        "total_chars": total_chars,
        "total_lines": total_lines
    }
    
    config_path = os.path.join("data", "cultivation_plans_config.json")
    try:
        with open(config_path, 'w', encoding='utf-8') as f:
            json.dump(config_data, f, ensure_ascii=False, indent=2)
        print(f"   ✅ 配置文件已保存: {config_path}")
        
    except Exception as e:
        print(f"   ❌ 生成配置文件失败: {e}")
    
    print("\n" + "=" * 60)
    print("✅ 所有培养方案处理完成")
    print("=" * 60)

if __name__ == "__main__":
    main() 