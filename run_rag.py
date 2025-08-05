#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
RAG系统快速启动脚本
"""

import os
import sys

def check_dependencies():
    """检查依赖包"""
    required_packages = [
        'sentence_transformers',
        'chromadb',
        'pandas',
        'torch',
        'transformers'
    ]
    
    missing_packages = []
    for package in required_packages:
        try:
            __import__(package)
        except ImportError:
            missing_packages.append(package)
    
    if missing_packages:
        print("❌ 缺少以下依赖包:")
        for package in missing_packages:
            print(f"   - {package}")
        print("\n请运行以下命令安装依赖:")
        print("pip install -r requirements.txt")
        return False
    
    print("✅ 所有依赖包已安装")
    return True

def check_data_files():
    """检查数据文件"""
    required_files = [
        "data/students.csv",
        "data/cultivation_plan.txt"
    ]
    
    missing_files = []
    for file_path in required_files:
        if not os.path.exists(file_path):
            missing_files.append(file_path)
    
    if missing_files:
        print("❌ 缺少以下数据文件:")
        for file_path in missing_files:
            print(f"   - {file_path}")
        return False
    
    print("✅ 所有数据文件已准备")
    return True

def main():
    """主函数"""
    print("🚀 RAG系统快速启动")
    print("=" * 50)
    
    # 检查依赖
    print("\n1. 检查依赖包...")
    if not check_dependencies():
        sys.exit(1)
    
    # 检查数据文件
    print("\n2. 检查数据文件...")
    if not check_data_files():
        sys.exit(1)
    
    # 启动RAG系统
    print("\n3. 启动RAG系统...")
    try:
        from main import main as rag_main
        rag_main()
    except Exception as e:
        print(f"❌ 启动失败: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main() 