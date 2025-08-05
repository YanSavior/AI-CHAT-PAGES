#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
下载BGE模型到本地
"""

import os
from huggingface_hub import snapshot_download
import time

def download_model(repo_id, local_dir):
    """下载模型到指定目录"""
    print(f"🔄 开始下载模型: {repo_id}")
    print(f"📁 下载到: {local_dir}")
    
    try:
        # 创建目录
        os.makedirs(local_dir, exist_ok=True)
        
        # 下载模型
        snapshot_download(
            repo_id=repo_id,
            local_dir=local_dir,
            local_dir_use_symlinks=False
        )
        
        print(f"✅ 模型下载完成: {repo_id}")
        return True
        
    except Exception as e:
        print(f"❌ 模型下载失败: {repo_id}")
        print(f"错误信息: {e}")
        return False

def main():
    """主函数"""
    print("🚀 开始下载BGE模型...")
    
    # 模型列表
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
    
    # 下载所有模型
    success_count = 0
    for model in models:
        print(f"\n📦 {model['description']}")
        print(f"模型ID: {model['repo_id']}")
        
        if download_model(model['repo_id'], model['local_dir']):
            success_count += 1
            print(f"✅ {model['description']} 下载成功")
        else:
            print(f"❌ {model['description']} 下载失败")
        
        # 等待一下，避免请求过于频繁
        time.sleep(2)
    
    print(f"\n📊 下载总结:")
    print(f"成功: {success_count}/{len(models)}")
    
    if success_count == len(models):
        print("🎉 所有模型下载完成！")
        print("\n📁 模型路径:")
        for model in models:
            print(f"  - {model['description']}: {model['local_dir']}")
    else:
        print("⚠️  部分模型下载失败，请检查网络连接")

if __name__ == "__main__":
    main() 