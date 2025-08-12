#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
RAG系统 - 自定义模型路径版本
"""

from rag_system import RAGSystem
import os

def create_rag_system_with_custom_paths():
    """创建带有自定义模型路径的RAG系统"""
    
    # 使用您的实际模型路径
    bi_encoder_path = "D:/bge_models/bge-small-zh-v1.5"
    cross_encoder_path = "D:/bge_models/bge-reranker-v2-m3"
    
    # 检查模型路径是否存在
    if os.path.exists(bi_encoder_path):
        print(f"✅ 找到Bi-Encoder模型: {bi_encoder_path}")
        # 检查模型文件
        model_files = os.listdir(bi_encoder_path)
        print(f"   模型文件: {model_files[:5]}...")  # 显示前5个文件
    else:
        print(f"❌ Bi-Encoder模型路径不存在: {bi_encoder_path}")
        print("请检查路径是否正确")
        return None
    
    if os.path.exists(cross_encoder_path):
        print(f"✅ 找到Cross-Encoder模型: {cross_encoder_path}")
        # 检查模型文件
        model_files = os.listdir(cross_encoder_path)
        print(f"   模型文件: {model_files[:5]}...")  # 显示前5个文件
    else:
        print(f"❌ Cross-Encoder模型路径不存在: {cross_encoder_path}")
        print("请检查路径是否正确")
        return None
    
    # 创建RAG系统
    try:
        print("\n🔄 正在创建RAG系统...")
        rag_system = RAGSystem(
            bi_encoder_model=bi_encoder_path,
            cross_encoder_model=cross_encoder_path,
            persist_directory="./vector_db"
        )
        print("✅ RAG系统创建成功")
        return rag_system
    except Exception as e:
        print(f"❌ RAG系统创建失败: {e}")
        return None

if __name__ == "__main__":
    print("🔍 检查模型路径...")
    rag_system = create_rag_system_with_custom_paths()
    
    if rag_system:
        print("\n🎯 测试RAG系统...")
        # 这里可以添加测试代码
    else:
        print("\n❌ 无法创建RAG系统，请检查模型路径") 