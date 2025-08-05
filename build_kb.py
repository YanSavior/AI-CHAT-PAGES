#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
手动构建知识库 - 处理真实毕业生数据和培养方案
"""

import pandas as pd
import os
import chromadb
from sentence_transformers import SentenceTransformer
import numpy as np
import re

def clean_text(text):
    """清理文本"""
    if pd.isna(text):
        return ""
    # 移除多余的空白字符
    text = re.sub(r'\s+', ' ', str(text).strip())
    return text

def split_cultivation_plan(content):
    """智能分割培养方案内容"""
    sections = []
    
    # 定义主要章节模式
    patterns = [
        r'一、专业介绍',
        r'二、培养目标与毕业要求',
        r'三、主干学科与专业核心课',
        r'四、课程设置及学分分配表',
        r'五、课程体系配置流程图',
        r'六、指导性教学计划进程',
        r'七、实践教学',
        r'八、毕业要求',
        r'九、就业方向',
        r'十、继续深造'
    ]
    
    # 查找所有章节位置
    positions = []
    for pattern in patterns:
        matches = list(re.finditer(pattern, content))
        positions.extend(matches)
    
    # 按位置排序
    positions.sort(key=lambda x: x.start())
    
    # 分割内容
    for i, pos in enumerate(positions):
        start = pos.start()
        if i + 1 < len(positions):
            end = positions[i + 1].start()
        else:
            end = len(content)
        
        section_content = content[start:end].strip()
        if section_content:
            sections.append(section_content)
    
    # 如果没有找到章节，按段落分割
    if not sections:
        paragraphs = content.split('\n\n')
        sections = [p.strip() for p in paragraphs if p.strip()]
    
    return sections

def build_knowledge_base():
    """构建知识库"""
    
    print("🚀 开始构建知识库...")
    
    # 初始化向量化器
    print("🔄 加载BGE模型...")
    try:
        model = SentenceTransformer("D:/bge_models/bge-small-zh-v1.5")
    except:
        print("⚠️ 本地模型未找到，尝试使用在线模型...")
        model = SentenceTransformer("BAAI/bge-small-zh-v1.5")
    print("✅ BGE模型加载完成")
    
    # 初始化ChromaDB
    print("🔄 初始化ChromaDB...")
    client = chromadb.PersistentClient(path="./vector_db")
    
    # 删除已存在的集合
    try:
        client.delete_collection("student_knowledge")
        print("🗑️ 删除旧集合")
    except:
        pass
    
    collection = client.create_collection(
        name="student_knowledge",
        metadata={"hnsw:space": "cosine"}
    )
    print("✅ ChromaDB初始化完成")
    
    all_documents = []
    all_metadatas = []
    doc_id_counter = 0
    
    # 处理真实毕业生数据
    print("📊 处理真实毕业生数据...")
    try:
        graduates_df = pd.read_csv("data/real_graduates.csv", encoding='utf-8')
        print(f"读取到 {len(graduates_df)} 条毕业生记录")
        
        for idx, row in graduates_df.iterrows():
            # 生成毕业生描述
            description = f"毕业生{clean_text(row['姓名'])}，学号{clean_text(row['学号'])}，"
            description += f"GPA成绩{clean_text(row['GPA'])}，所在地{clean_text(row['所在地'])}，"
            description += f"发展方向{clean_text(row['发展方向'])}，"
            
            if pd.notna(row['就业去向']) and clean_text(row['就业去向']) != '':
                description += f"就业去向{clean_text(row['就业去向'])}，"
            
            if pd.notna(row['年薪']) and clean_text(row['年薪']) != '':
                description += f"年薪{clean_text(row['年薪'])}"
            else:
                description += "年薪信息未提供"
            
            all_documents.append(description)
            all_metadatas.append({
                "type": "graduate",
                "student_id": clean_text(row['学号']),
                "name": clean_text(row['姓名']),
                "gpa": clean_text(row['GPA']),
                "location": clean_text(row['所在地']),
                "career_path": clean_text(row['发展方向']),
                "employment": clean_text(row['就业去向']),
                "salary": clean_text(row['年薪'])
            })
            doc_id_counter += 1
            
    except Exception as e:
        print(f"❌ 处理毕业生数据时出错: {e}")
    
    # 处理培养方案数据
    print("📋 处理培养方案数据...")
    try:
        with open("data/all_cultivation_plans.txt", "r", encoding="utf-8") as f:
            plan_content = f.read()
        
        # 按专业分割
        major_sections = re.split(r'## (.+?) 专业专业培养方案', plan_content)
        
        for i in range(1, len(major_sections), 2):
            if i + 1 < len(major_sections):
                major_name = major_sections[i].strip()
                major_content = major_sections[i + 1].strip()
                
                if major_name and major_content:
                    # 分割专业内容
                    sections = split_cultivation_plan(major_content)
                    
                    for j, section in enumerate(sections):
                        if len(section.strip()) > 50:  # 过滤太短的段落
                            all_documents.append(section.strip())
                            all_metadatas.append({
                                "type": "cultivation_plan",
                                "major": major_name,
                                "section_id": j,
                                "section_name": section[:50] + "..." if len(section) > 50 else section
                            })
                            doc_id_counter += 1
                            
    except Exception as e:
        print(f"❌ 处理培养方案数据时出错: {e}")
    
    print(f"📝 总共 {len(all_documents)} 个文档")
    
    if len(all_documents) == 0:
        print("❌ 没有找到有效文档，知识库构建失败")
        return None
    
    # 向量化文档
    print("🔄 向量化文档...")
    try:
        embeddings = model.encode(all_documents, show_progress_bar=True, batch_size=32)
        
        # 生成文档ID
        doc_ids = [f"doc_{i}" for i in range(len(all_documents))]
        
        # 添加到向量数据库
        print("💾 存储到向量数据库...")
        collection.add(
            documents=all_documents,
            embeddings=embeddings.tolist(),
            metadatas=all_metadatas,
            ids=doc_ids
        )
        
        print("✅ 知识库构建完成！")
        
        # 显示统计信息
        graduate_count = sum(1 for meta in all_metadatas if meta['type'] == 'graduate')
        plan_count = sum(1 for meta in all_metadatas if meta['type'] == 'cultivation_plan')
        
        print(f"\n📊 统计信息:")
        print(f"  - 毕业生文档: {graduate_count} 个")
        print(f"  - 培养方案文档: {plan_count} 个")
        print(f"  - 总文档数: {len(all_documents)} 个")
        print(f"  - 向量维度: {embeddings.shape[1]}")
        
        return collection
        
    except Exception as e:
        print(f"❌ 向量化过程中出错: {e}")
        return None

def test_knowledge_base(collection):
    """测试知识库"""
    if collection is None:
        print("❌ 知识库未构建成功，无法测试")
        return
    
    print(f"\n🔍 测试查询:")
    test_questions = [
        "有哪些高薪就业的毕业生？",
        "微电子科学与工程专业的培养目标是什么？",
        "GPA成绩高的学生就业情况如何？",
        "有哪些核心课程？",
        "人工智能方向的毕业生去向如何？"
    ]
    
    try:
        model = SentenceTransformer("D:/bge_models/bge-small-zh-v1.5")
    except:
        model = SentenceTransformer("BAAI/bge-small-zh-v1.5")
    
    for question in test_questions:
        print(f"\n问题: {question}")
        
        try:
            # 向量化问题
            query_embedding = model.encode([question])
            
            # 搜索
            results = collection.query(
                query_embeddings=query_embedding.tolist(),
                n_results=3
            )
            
            print("相关文档:")
            for i, doc in enumerate(results['documents'][0]):
                metadata = results['metadatas'][0][i]
                print(f"  {i+1}. [{metadata['type']}] {doc[:150]}...")
                
        except Exception as e:
            print(f"  ❌ 查询失败: {e}")

def main():
    """主函数"""
    print("=" * 60)
    print("知识库构建工具 - 真实毕业生数据 + 培养方案")
    print("=" * 60)
    
    # 构建知识库
    collection = build_knowledge_base()
    
    # 测试知识库
    test_knowledge_base(collection)
    
    print(f"\n🎉 知识库构建和测试完成！")
    print(f"📁 向量数据库保存在: ./vector_db/")

if __name__ == "__main__":
    main() 