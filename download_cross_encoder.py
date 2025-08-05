#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
下载Cross-Encoder模型到D盘
确保不会下载到C盘缓存
"""

import os
import shutil
import time
from transformers import AutoModelForSequenceClassification, AutoTokenizer
import torch

def download_cross_encoder(max_retries=3):
    """下载Cross-Encoder模型到D盘"""
    
    # 设置目标路径
    target_dir = "D:/bge_models/bge-reranker-v2-m3"
    model_name = "BAAI/bge-reranker-v2-m3"
    
    print("🚀 开始下载Cross-Encoder模型...")
    print(f"📁 目标路径: {target_dir}")
    print(f"🔗 模型名称: {model_name}")
    
    for attempt in range(max_retries):
        try:
            print(f"\n🔄 第 {attempt + 1} 次尝试下载...")
            
            # 创建目标目录
            os.makedirs(target_dir, exist_ok=True)
            print("✅ 目标目录创建完成")
            
            # 设置环境变量，强制使用D盘缓存
            os.environ['TRANSFORMERS_CACHE'] = 'D:/transformers_cache'
            os.environ['HF_HOME'] = 'D:/huggingface_cache'
            
            print("🔄 正在下载模型文件...")
            
            # 下载模型（强制重新下载）
            model = AutoModelForSequenceClassification.from_pretrained(
                model_name,
                cache_dir='D:/transformers_cache',
                local_files_only=False,
                force_download=True
            )
            
            print("🔄 正在下载分词器...")
            
            # 下载分词器（强制重新下载）
            tokenizer = AutoTokenizer.from_pretrained(
                model_name,
                cache_dir='D:/transformers_cache',
                local_files_only=False,
                force_download=True
            )
            
            print("✅ 模型和分词器下载完成")
            
            # 保存到目标目录
            print("🔄 正在保存到目标目录...")
            model.save_pretrained(target_dir)
            tokenizer.save_pretrained(target_dir)
            
            print("✅ 模型保存到目标目录完成")
            
            # 验证文件
            print("🔍 验证下载的文件...")
            files = os.listdir(target_dir)
            print(f"📁 目标目录中的文件: {files}")
            
            # 检查关键文件（支持多种格式）
            required_files = ['config.json', 'tokenizer.json']
            model_files = ['pytorch_model.bin', 'model.safetensors']
            
            missing_files = []
            
            # 检查必需文件
            for file in required_files:
                if file not in files:
                    missing_files.append(file)
            
            # 检查模型文件（至少需要一个）
            has_model_file = any(model_file in files for model_file in model_files)
            if not has_model_file:
                missing_files.append('模型文件 (pytorch_model.bin 或 model.safetensors)')
            
            if missing_files:
                print(f"⚠️  缺少文件: {missing_files}")
                raise Exception(f"缺少必需文件: {missing_files}")
            else:
                print("✅ 所有必需文件都已下载")
                # 显示实际使用的模型文件
                actual_model_file = next((f for f in model_files if f in files), None)
                if actual_model_file:
                    print(f"📦 使用模型文件: {actual_model_file}")
            
            # 清理缓存目录
            print("🧹 清理临时缓存...")
            if os.path.exists('D:/transformers_cache'):
                shutil.rmtree('D:/transformers_cache')
            if os.path.exists('D:/huggingface_cache'):
                shutil.rmtree('D:/huggingface_cache')
            
            print("🎉 Cross-Encoder模型下载完成！")
            print(f"📁 模型位置: {target_dir}")
            
            return True
            
        except Exception as e:
            print(f"❌ 第 {attempt + 1} 次尝试失败: {e}")
            
            # 清理可能损坏的缓存
            if os.path.exists('D:/transformers_cache'):
                shutil.rmtree('D:/transformers_cache')
            if os.path.exists('D:/huggingface_cache'):
                shutil.rmtree('D:/huggingface_cache')
            
            if attempt < max_retries - 1:
                print(f"⏳ 等待 5 秒后重试...")
                time.sleep(5)
            else:
                print("❌ 所有尝试都失败了")
                return False
    
    return False

def main():
    """主函数"""
    print("=" * 50)
    print("Cross-Encoder模型下载工具")
    print("=" * 50)
    
    # 检查目标目录
    target_dir = "D:/bge_models/bge-reranker-v2-m3"
    
    if os.path.exists(target_dir):
        print(f"📁 目标目录已存在: {target_dir}")
        response = input("是否继续下载？(y/n): ")
        if response.lower() != 'y':
            print("下载已取消")
            return
    
    # 开始下载
    success = download_cross_encoder(max_retries=3)
    
    if success:
        print("\n🎉 下载成功！")
        print("现在可以重新启动RAG系统了")
    else:
        print("\n❌ 下载失败，请检查网络连接")
        print("💡 建议：")
        print("1. 检查网络连接是否稳定")
        print("2. 尝试使用VPN或代理")
        print("3. 或者手动从HuggingFace网站下载模型文件")

if __name__ == "__main__":
    main() 