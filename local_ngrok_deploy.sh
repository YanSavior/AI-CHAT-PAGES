#!/bin/bash

echo "🚀 RAG系统本地+ngrok部署脚本"
echo "================================"

echo ""
echo "检查Python环境..."
if ! command -v python3 &> /dev/null; then
    echo "❌ 错误：未找到Python3，请先安装Python 3.8+"
    exit 1
fi

echo ""
echo "检查pip..."
if ! command -v pip3 &> /dev/null; then
    echo "❌ 错误：未找到pip3，请先安装pip"
    exit 1
fi

echo ""
echo "安装依赖包..."
pip3 install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "❌ 错误：依赖安装失败"
    exit 1
fi

echo ""
echo "检查ngrok..."
if ! command -v ngrok &> /dev/null; then
    echo "⚠️  警告：未找到ngrok"
    echo ""
    echo "请按照以下步骤安装ngrok："
    echo "1. 访问 https://ngrok.com/"
    echo "2. 注册免费账号"
    echo "3. 下载ngrok"
    echo "4. 解压并添加到PATH"
    echo "5. 运行 'ngrok config add-authtoken YOUR_TOKEN'"
    echo ""
    echo "或者使用以下命令下载："
    echo "curl -O https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-amd64.tgz"
    echo ""
    read -p "是否继续启动本地服务器？(y/n): " continue
    if [[ ! $continue =~ ^[Yy]$ ]]; then
        exit 0
    fi
fi

echo ""
echo "启动RAG API服务器..."
echo "服务器将在 http://localhost:8000 启动"
echo ""
echo "按 Ctrl+C 停止服务器"
echo ""

# 启动API服务器
python3 api_server.py &
API_PID=$!

echo ""
echo "等待服务器启动..."
sleep 5

echo ""
echo "检查服务器状态..."
if curl -s http://localhost:8000/api/health > /dev/null; then
    echo "✅ 服务器启动成功！"
else
    echo "⚠️  警告：服务器可能未完全启动，请稍等片刻"
fi

echo ""
if command -v ngrok &> /dev/null; then
    echo "启动ngrok隧道..."
    echo "公网地址将显示在ngrok窗口中"
    echo ""
    
    # 启动ngrok
    ngrok http 8000 &
    NGROK_PID=$!
    
    echo ""
    echo "🎉 部署完成！"
    echo ""
    echo "📍 本地地址: http://localhost:8000"
    echo "🌐 公网地址: 查看ngrok窗口"
    echo "📚 API文档: http://localhost:8000/docs"
    echo ""
    echo "💡 使用说明："
    echo "1. 本地访问: http://localhost:8000"
    echo "2. 公网访问: 使用ngrok生成的地址"
    echo "3. 测试API: http://localhost:8000/api/health"
    echo "4. 查询接口: POST http://localhost:8000/api/query"
    echo ""
    echo "⚠️  注意：ngrok免费版每次重启会生成新的公网地址"
    echo ""
    echo "按 Ctrl+C 停止所有服务..."
    
    # 等待用户中断
    trap "echo '正在停止服务...'; kill $API_PID $NGROK_PID 2>/dev/null; exit 0" INT
    wait
else
    echo "⚠️  未找到ngrok，仅启动本地服务器"
    echo ""
    echo "📍 本地地址: http://localhost:8000"
    echo "📚 API文档: http://localhost:8000/docs"
    echo ""
    echo "按 Ctrl+C 停止服务..."
    
    # 等待用户中断
    trap "echo '正在停止服务...'; kill $API_PID 2>/dev/null; exit 0" INT
    wait
fi 