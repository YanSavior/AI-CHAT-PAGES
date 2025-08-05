#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
使用国内镜像下载BGE模型
"""

import os
import requests
import json
from huggingface_hub import snapshot_download
import time

def download_with_mirror():
    """使用国内镜像下载模型"""
    print("🔄 尝试使用国内镜像下载...")
    
    # 设置环境变量使用国内镜像
    os.environ['HF_ENDPOINT'] = 'https://hf-mirror.com'
    
    models = [
        {
            "repo_id": "BAAI/bge-small-zh-v1.5",
            "local_dir": "D:/bge_models/bge-small-zh-v1.5",
            "description": "BGE Bi-Encoder模型"
        },
        {
            "repo_id": "BAAI/bge-reranker-v2-m3",
            "local_dir": "D:/bge_models/bge-reranker-v2-m3",
            "description": "BGE Cross-Encoder模型"
        }
    ]
    
    success_count = 0
    for model in models:
        print(f"\n📦 {model['description']}")
        print(f"模型ID: {model['repo_id']}")
        
        try:
            # 创建目录
            os.makedirs(model['local_dir'], exist_ok=True)
            
            # 下载模型
            snapshot_download(
                repo_id=model['repo_id'],
                local_dir=model['local_dir'],
                local_dir_use_symlinks=False
            )
            
            print(f"✅ {model['description']} 下载成功")
            success_count += 1
            
        except Exception as e:
            print(f"❌ {model['description']} 下载失败: {e}")
        
        time.sleep(2)
    
    return success_count, len(models)

def create_minimal_model():
    """创建最小化的模型文件（用于测试）"""
    print("🔄 创建最小化的模型文件...")
    
    # Bi-Encoder模型
    bi_encoder_dir = "D:/bge_models/bge-small-zh-v1.5"
    os.makedirs(bi_encoder_dir, exist_ok=True)
    
    # 创建配置文件
    config = {
        "model_type": "bert",
        "architectures": ["BertModel"],
        "hidden_size": 768,
        "num_attention_heads": 12,
        "num_hidden_layers": 12,
        "vocab_size": 21128
    }
    
    with open(f"{bi_encoder_dir}/config.json", "w", encoding="utf-8") as f:
        json.dump(config, f, indent=2, ensure_ascii=False)
    
    # Cross-Encoder模型
    cross_encoder_dir = "D:/bge_models/bge-reranker-v2-m3"
    os.makedirs(cross_encoder_dir, exist_ok=True)
    
    cross_config = {
        "model_type": "bert",
        "architectures": ["BertForSequenceClassification"],
        "hidden_size": 768,
        "num_attention_heads": 12,
        "num_hidden_layers": 12,
        "vocab_size": 21128,
        "num_labels": 1
    }
    
    with open(f"{cross_encoder_dir}/config.json", "w", encoding="utf-8") as f:
        json.dump(cross_config, f, indent=2, ensure_ascii=False)
    
    print("✅ 最小化模型文件创建完成")
    return True

def main():
    """主函数"""
    print("🚀 开始下载BGE模型...")
    
    # 首先尝试使用镜像下载
    success_count, total_count = download_with_mirror()
    
    if success_count == total_count:
        print("🎉 所有模型下载完成！")
        print("\n📁 模型路径:")
        print("  - BGE Bi-Encoder模型: D:/bge_models/bge-small-zh-v1.5")
        print("  - BGE Cross-Encoder模型: D:/bge_models/bge-reranker-v2-m3")
    else:
        print(f"⚠️  只有 {success_count}/{total_count} 个模型下载成功")
        print("🔄 创建最小化模型文件用于测试...")
        create_minimal_model()
        print("📁 模型路径:")
        print("  - BGE Bi-Encoder模型: D:/bge_models/bge-small-zh-v1.5")
        print("  - BGE Cross-Encoder模型: D:/bge_models/bge-reranker-v2-m3")

if __name__ == "__main__":
    main() 