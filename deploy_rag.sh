#!/bin/bash

echo "🚀 RAG API 部署脚本"
echo "=================="

# 检查是否安装了必要的工具
check_dependencies() {
    echo "检查依赖..."
    
    if ! command -v git &> /dev/null; then
        echo "❌ Git 未安装"
        exit 1
    fi
    
    if ! command -v python3 &> /dev/null; then
        echo "❌ Python3 未安装"
        exit 1
    fi
    
    echo "✅ 依赖检查通过"
}

# 准备部署文件
prepare_deployment() {
    echo "准备部署文件..."
    
    # 创建部署目录
    mkdir -p deploy_rag
    
    # 复制必要文件
    cp -r rag_system/ deploy_rag/
    cp -r data/ deploy_rag/
    cp api_server.py deploy_rag/
    cp requirements.txt deploy_rag/
    cp Procfile deploy_rag/
    cp runtime.txt deploy_rag/
    cp railway.json deploy_rag/
    cp .gitignore deploy_rag/
    
    echo "✅ 部署文件准备完成"
}

# 部署到Railway
deploy_to_railway() {
    echo "部署到 Railway..."
    
    cd deploy_rag
    
    # 初始化Git仓库
    git init
    git add .
    git commit -m "Initial RAG API deployment"
    
    echo "请按照以下步骤操作："
    echo "1. 访问 https://railway.app"
    echo "2. 使用GitHub账号登录"
    echo "3. 点击 'New Project'"
    echo "4. 选择 'Deploy from GitHub repo'"
    echo "5. 选择您的GitHub仓库"
    echo "6. 等待部署完成"
    echo "7. 复制生成的域名"
    
    echo ""
    echo "部署完成后，请更新前端代码中的API地址："
    echo "将 'https://your-rag-api.railway.app' 替换为实际的Railway域名"
}

# 部署到Render
deploy_to_render() {
    echo "部署到 Render..."
    
    cd deploy_rag
    
    echo "请按照以下步骤操作："
    echo "1. 访问 https://render.com"
    echo "2. 使用GitHub账号登录"
    echo "3. 点击 'New +' 选择 'Web Service'"
    echo "4. 连接您的GitHub仓库"
    echo "5. 设置以下配置："
    echo "   - Name: rag-api"
    echo "   - Environment: Python 3"
    echo "   - Build Command: pip install -r requirements.txt"
    echo "   - Start Command: uvicorn api_server:app --host 0.0.0.0 --port \$PORT"
    echo "6. 点击 'Create Web Service'"
    echo "7. 等待部署完成"
    echo "8. 复制生成的域名"
}

# 主菜单
main_menu() {
    echo ""
    echo "选择部署平台："
    echo "1. Railway (推荐)"
    echo "2. Render"
    echo "3. 退出"
    echo ""
    read -p "请输入选择 (1-3): " choice
    
    case $choice in
        1)
            check_dependencies
            prepare_deployment
            deploy_to_railway
            ;;
        2)
            check_dependencies
            prepare_deployment
            deploy_to_render
            ;;
        3)
            echo "退出部署"
            exit 0
            ;;
        *)
            echo "无效选择"
            main_menu
            ;;
    esac
}

# 运行主菜单
main_menu 