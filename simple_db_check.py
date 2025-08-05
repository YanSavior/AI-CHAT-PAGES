#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
简化的RAG系统数据库检查
不依赖外部包，只检查文件系统
"""

import os
import json

def check_database_files():
    """检查数据库文件"""
    print("🔍 检查RAG系统数据库文件")
    print("=" * 50)
    
    # 检查向量数据库目录
    vector_db_dir = "./vector_db"
    if os.path.exists(vector_db_dir):
        print(f"✅ 向量数据库目录存在: {vector_db_dir}")
        
        # 列出目录内容
        try:
            files = os.listdir(vector_db_dir)
            print(f"📁 数据库文件数量: {len(files)}")
            total_size = 0
            for file in files:
                file_path = os.path.join(vector_db_dir, file)
                size = os.path.getsize(file_path)
                total_size += size
                print(f"   - {file} ({size} bytes)")
            print(f"📊 数据库总大小: {total_size} bytes ({total_size/1024/1024:.2f} MB)")
        except Exception as e:
            print(f"❌ 无法读取数据库目录: {e}")
    else:
        print(f"❌ 向量数据库目录不存在: {vector_db_dir}")
    
    # 检查数据文件
    print("\n📄 数据文件检查:")
    data_files = [
        ("学生数据", "data/students.csv"),
        ("培养方案", "data/cultivation_plan.txt")
    ]
    
    for name, path in data_files:
        if os.path.exists(path):
            size = os.path.getsize(path)
            print(f"   ✅ {name}: {path} ({size} bytes)")
            
            # 显示文件内容预览
            try:
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    lines = content.split('\n')
                    print(f"      📝 行数: {len(lines)}")
                    if len(lines) > 1:
                        print(f"      📋 第一行: {lines[0][:100]}...")
            except Exception as e:
                print(f"      ❌ 读取失败: {e}")
        else:
            print(f"   ❌ {name}: {path} (不存在)")
    
    # 检查项目结构
    print("\n📁 项目结构检查:")
    project_files = [
        ("RAG系统主模块", "rag_system/rag_system.py"),
        ("向量化模块", "rag_system/vectorizer.py"),
        ("向量数据库模块", "rag_system/vector_db.py"),
        ("数据处理模块", "rag_system/data_processor.py"),
        ("主程序", "main.py"),
        ("API服务器", "api_server.py"),
        ("依赖文件", "requirements.txt"),
        ("快速启动脚本", "run_rag.py")
    ]
    
    for name, path in project_files:
        if os.path.exists(path):
            size = os.path.getsize(path)
            print(f"   ✅ {name}: {path} ({size} bytes)")
        else:
            print(f"   ❌ {name}: {path} (不存在)")
    
    # 检查ChromaDB配置文件
    print("\n🔧 ChromaDB配置检查:")
    chroma_files = [
        "vector_db/chroma.sqlite3",
        "vector_db/chroma.sqlite3-shm",
        "vector_db/chroma.sqlite3-wal"
    ]
    
    for file_path in chroma_files:
        if os.path.exists(file_path):
            size = os.path.getsize(file_path)
            print(f"   ✅ {file_path} ({size} bytes)")
        else:
            print(f"   ❌ {file_path} (不存在)")

def check_data_content():
    """检查数据内容"""
    print("\n" + "=" * 50)
    print("📋 数据内容检查")
    print("=" * 50)
    
    # 检查学生数据
    student_csv = "data/students.csv"
    if os.path.exists(student_csv):
        print(f"\n👥 学生数据内容:")
        try:
            with open(student_csv, 'r', encoding='utf-8') as f:
                lines = f.readlines()
                print(f"   总行数: {len(lines)}")
                if len(lines) > 0:
                    print(f"   表头: {lines[0].strip()}")
                    print(f"   数据行数: {len(lines) - 1}")
                    
                    # 显示前几行数据
                    print("   前3行数据:")
                    for i, line in enumerate(lines[1:4], 1):
                        if line.strip():
                            fields = line.strip().split(',')
                            print(f"     {i}. {fields[1]} - {fields[2]} - {fields[4]}")
        except Exception as e:
            print(f"   ❌ 读取失败: {e}")
    
    # 检查培养方案
    plan_txt = "data/cultivation_plan.txt"
    if os.path.exists(plan_txt):
        print(f"\n📚 培养方案内容:")
        try:
            with open(plan_txt, 'r', encoding='utf-8') as f:
                content = f.read()
                print(f"   总字符数: {len(content)}")
                lines = content.split('\n')
                print(f"   总行数: {len(lines)}")
                
                # 显示主要章节
                print("   主要章节:")
                for line in lines:
                    if line.strip() and ('：' in line or ':' in line):
                        if len(line.strip()) < 50:  # 只显示较短的标题行
                            print(f"     - {line.strip()}")
        except Exception as e:
            print(f"   ❌ 读取失败: {e}")

def check_system_status():
    """检查系统状态"""
    print("\n" + "=" * 50)
    print("🔧 系统状态检查")
    print("=" * 50)
    
    # 检查Python环境
    print(f"\n🐍 Python环境:")
    import sys
    print(f"   Python版本: {sys.version}")
    print(f"   当前目录: {os.getcwd()}")
    
    # 检查可用包
    print(f"\n📦 可用包检查:")
    required_packages = [
        'sentence_transformers',
        'chromadb',
        'pandas',
        'torch',
        'transformers',
        'fastapi',
        'uvicorn'
    ]
    
    for package in required_packages:
        try:
            __import__(package)
            print(f"   ✅ {package}")
        except ImportError:
            print(f"   ❌ {package} (未安装)")
    
    # 检查磁盘空间
    print(f"\n💾 磁盘空间:")
    try:
        import shutil
        total, used, free = shutil.disk_usage(".")
        print(f"   总空间: {total // (1024**3)} GB")
        print(f"   已使用: {used // (1024**3)} GB")
        print(f"   可用空间: {free // (1024**3)} GB")
    except Exception as e:
        print(f"   ❌ 无法获取磁盘信息: {e}")

if __name__ == "__main__":
    check_database_files()
    check_data_content()
    check_system_status()
    
    print("\n" + "=" * 50)
    print("✅ 数据库检查完成")
    print("=" * 50) 