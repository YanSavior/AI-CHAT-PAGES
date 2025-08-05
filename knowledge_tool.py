#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
知识库查询工具
"""

import chromadb
from sentence_transformers import SentenceTransformer
import pandas as pd

class KnowledgeBaseQuery:
    def __init__(self):
        """初始化知识库查询器"""
        print("🔄 初始化知识库查询器...")
        
        # 加载模型
        try:
            self.model = SentenceTransformer("D:/bge_models/bge-small-zh-v1.5")
        except:
            print("⚠️ 本地模型未找到，使用在线模型...")
            self.model = SentenceTransformer("BAAI/bge-small-zh-v1.5")
        
        # 连接ChromaDB
        try:
            self.client = chromadb.PersistentClient(path="./vector_db")
            self.collection = self.client.get_collection("student_knowledge")
            print("✅ 知识库连接成功")
        except Exception as e:
            print(f"❌ 连接知识库失败: {e}")
            self.collection = None
    
    def search(self, query, n_results=5):
        """搜索知识库"""
        if self.collection is None:
            print("❌ 知识库未连接")
            return None
        
        try:
            # 向量化查询
            query_embedding = self.model.encode([query])
            
            # 搜索
            results = self.collection.query(
                query_embeddings=query_embedding.tolist(),
                n_results=n_results
            )
            
            return results
        except Exception as e:
            print(f"❌ 搜索失败: {e}")
            return None
    
    def search_graduates(self, query, n_results=5):
        """专门搜索毕业生信息"""
        if self.collection is None:
            return None
        
        try:
            # 向量化查询
            query_embedding = self.model.encode([query])
            
            # 搜索，只返回毕业生类型
            results = self.collection.query(
                query_embeddings=query_embedding.tolist(),
                n_results=n_results * 2,  # 获取更多结果以便过滤
                where={"type": "graduate"}
            )
            
            return results
        except Exception as e:
            print(f"❌ 搜索毕业生信息失败: {e}")
            return None
    
    def search_cultivation_plans(self, query, n_results=5):
        """专门搜索培养方案信息"""
        if self.collection is None:
            return None
        
        try:
            # 向量化查询
            query_embedding = self.model.encode([query])
            
            # 搜索，只返回培养方案类型
            results = self.collection.query(
                query_embeddings=query_embedding.tolist(),
                n_results=n_results * 2,  # 获取更多结果以便过滤
                where={"type": "cultivation_plan"}
            )
            
            return results
        except Exception as e:
            print(f"❌ 搜索培养方案失败: {e}")
            return None
    
    def get_statistics(self):
        """获取知识库统计信息"""
        if self.collection is None:
            return None
        
        try:
            # 获取所有文档
            all_results = self.collection.get()
            
            graduate_count = sum(1 for meta in all_results['metadatas'] if meta['type'] == 'graduate')
            plan_count = sum(1 for meta in all_results['metadatas'] if meta['type'] == 'cultivation_plan')
            
            return {
                'total_documents': len(all_results['documents']),
                'graduate_documents': graduate_count,
                'cultivation_plan_documents': plan_count
            }
        except Exception as e:
            print(f"❌ 获取统计信息失败: {e}")
            return None
    
    def display_results(self, results, query):
        """显示搜索结果"""
        if results is None or not results['documents']:
            print("❌ 没有找到相关结果")
            return
        
        print(f"\n🔍 查询: {query}")
        print(f"📊 找到 {len(results['documents'][0])} 个相关文档:")
        print("-" * 80)
        
        for i, doc in enumerate(results['documents'][0]):
            metadata = results['metadatas'][0][i]
            distance = results['distances'][0][i] if 'distances' in results else "N/A"
            
            print(f"\n📄 文档 {i+1} (相似度: {1-distance:.3f})")
            print(f"   类型: {metadata['type']}")
            
            if metadata['type'] == 'graduate':
                print(f"   姓名: {metadata.get('name', 'N/A')}")
                print(f"   GPA: {metadata.get('gpa', 'N/A')}")
                print(f"   发展方向: {metadata.get('career_path', 'N/A')}")
                print(f"   就业去向: {metadata.get('employment', 'N/A')}")
                print(f"   年薪: {metadata.get('salary', 'N/A')}")
            elif metadata['type'] == 'cultivation_plan':
                print(f"   专业: {metadata.get('major', 'N/A')}")
                print(f"   章节: {metadata.get('section_name', 'N/A')}")
            
            print(f"   内容: {doc[:200]}...")
            print("-" * 40)

def interactive_query():
    """交互式查询"""
    kb = KnowledgeBaseQuery()
    
    if kb.collection is None:
        print("❌ 无法连接到知识库，请先运行 build_kb.py 构建知识库")
        return
    
    # 显示统计信息
    stats = kb.get_statistics()
    if stats:
        print(f"\n📊 知识库统计:")
        print(f"  总文档数: {stats['total_documents']}")
        print(f"  毕业生文档: {stats['graduate_documents']}")
        print(f"  培养方案文档: {stats['cultivation_plan_documents']}")
    
    print("\n" + "="*60)
    print("🎯 知识库查询工具")
    print("="*60)
    print("支持的功能:")
    print("1. 通用搜索 - 搜索所有类型文档")
    print("2. 毕业生搜索 - 专门搜索毕业生信息")
    print("3. 培养方案搜索 - 专门搜索培养方案")
    print("4. 退出")
    print("="*60)
    
    while True:
        try:
            choice = input("\n请选择功能 (1-4): ").strip()
            
            if choice == '4':
                print("👋 再见！")
                break
            
            if choice not in ['1', '2', '3']:
                print("❌ 无效选择，请输入 1-4")
                continue
            
            query = input("请输入查询内容: ").strip()
            if not query:
                print("❌ 查询内容不能为空")
                continue
            
            n_results = input("请输入返回结果数量 (默认5): ").strip()
            n_results = int(n_results) if n_results.isdigit() else 5
            
            if choice == '1':
                results = kb.search(query, n_results)
            elif choice == '2':
                results = kb.search_graduates(query, n_results)
            elif choice == '3':
                results = kb.search_cultivation_plans(query, n_results)
            
            kb.display_results(results, query)
            
        except KeyboardInterrupt:
            print("\n👋 再见！")
            break
        except Exception as e:
            print(f"❌ 发生错误: {e}")

def main():
    """主函数"""
    print("🚀 启动知识库查询工具...")
    interactive_query()

if __name__ == "__main__":
    main() 