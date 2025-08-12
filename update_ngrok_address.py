#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
自动更新ngrok地址的脚本
"""

import re
import os
import requests
import time

def get_ngrok_address():
    """从ngrok API获取当前地址"""
    try:
        # 尝试从ngrok API获取地址
        response = requests.get('http://127.0.0.1:4040/api/tunnels', timeout=5)
        if response.status_code == 200:
            data = response.json()
            if data['tunnels']:
                return data['tunnels'][0]['public_url']
    except:
        pass
    
    # 如果API不可用，提示用户手动输入
    print("无法自动获取ngrok地址，请手动输入：")
    return input("请输入新的ngrok地址（例如：https://xxxxx.ngrok-free.app）：").strip()

def update_file_content(file_path, old_address, new_address):
    """更新文件中的ngrok地址"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 使用正则表达式替换地址
        # 匹配 https://xxxxx.ngrok-free.app 格式
        pattern = r'https://[a-zA-Z0-9-]+\.ngrok-free\.app'
        new_content = re.sub(pattern, new_address, content)
        
        if new_content != content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"✅ 已更新文件: {file_path}")
            return True
        else:
            print(f"⚠️  文件未变化: {file_path}")
            return False
    except Exception as e:
        print(f"❌ 更新文件失败 {file_path}: {e}")
        return False

def main():
    print("🔄 自动更新ngrok地址")
    print("=" * 30)
    
    # 获取新的ngrok地址
    new_address = get_ngrok_address()
    if not new_address:
        print("❌ 未获取到有效的ngrok地址")
        return
    
    print(f"🌐 新的ngrok地址: {new_address}")
    
    # 需要更新的文件列表
    files_to_update = [
        "src/config/ragConfig.js",
        "test_frontend_rag_connection.js"
    ]
    
    print("\n📝 开始更新文件...")
    updated_count = 0
    
    for file_path in files_to_update:
        if os.path.exists(file_path):
            if update_file_content(file_path, "", new_address):
                updated_count += 1
        else:
            print(f"⚠️  文件不存在: {file_path}")
    
    print(f"\n🎉 更新完成！共更新了 {updated_count} 个文件")
    
    # 显示更新后的配置
    print(f"\n📋 当前配置:")
    print(f"   RAG API地址: {new_address}")
    print(f"   健康检查: {new_address}/api/health")
    print(f"   知识库构建: {new_address}/api/build_knowledge_base")
    print(f"   查询接口: {new_address}/api/query")
    
    print("\n💡 提示:")
    print("1. 如果知识库需要重新构建，请访问构建接口")
    print("2. 前端应用可能需要重启以加载新配置")
    print("3. 可以使用 test_frontend_rag_connection.js 测试连接")

if __name__ == "__main__":
    main() 