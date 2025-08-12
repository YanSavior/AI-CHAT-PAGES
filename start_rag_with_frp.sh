#!/bin/bash

echo "==================================="
echo "启动RAG系统和frp内网穿透服务"
echo "==================================="

# 检查Python是否安装
if ! command -v python3 &> /dev/null; then
    echo "[错误] 未检测到Python，请确保已安装Python 3"
    exit 1
fi

# 检查frp客户端是否存在
FRP_PATH="./frpc"
if [ ! -f "$FRP_PATH" ]; then
    echo "[警告] 未在当前目录找到frpc，请确认frp客户端位置"
    read -p "请输入frpc的完整路径: " FRP_PATH
    if [ ! -f "$FRP_PATH" ]; then
        echo "[错误] 未找到frpc: $FRP_PATH"
        exit 1
    fi
fi

# 检查frp配置文件
if [ ! -f "frpc.ini" ]; then
    echo "[错误] 未找到frpc.ini配置文件"
    exit 1
fi

# 修改frp配置中的子域名
read -p "请输入您想使用的子域名前缀 (例如: myrag): " SUBDOMAIN
if [ -z "$SUBDOMAIN" ]; then
    SUBDOMAIN="rag-$RANDOM"
fi

echo "[信息] 将使用子域名: $SUBDOMAIN.frp.104300.xyz"

# 更新frpc.ini中的子域名
sed -i "s/your-subdomain/$SUBDOMAIN/g" frpc.ini

# 创建临时目录
mkdir -p temp

# 在后台启动RAG系统API服务器
echo "[1/3] 启动RAG系统API服务器..."
python3 api_server.py > temp/api_server.log 2>&1 &
API_PID=$!

# 等待API服务器启动
echo "[2/3] 等待API服务器启动..."
sleep 5

# 检查API服务器是否正常启动
if ! ps -p $API_PID > /dev/null; then
    echo "[错误] API服务器启动失败，请检查temp/api_server.log"
    exit 1
fi

# 启动frp客户端
echo "[3/3] 启动frp内网穿透..."
chmod +x "$FRP_PATH"
"$FRP_PATH" -c frpc.ini > temp/frp.log 2>&1 &
FRP_PID=$!

# 等待frp连接建立
echo "等待frp隧道建立..."
sleep 5

# 检查frp是否正常启动
if ! ps -p $FRP_PID > /dev/null; then
    echo "[错误] frp启动失败，请检查temp/frp.log"
    kill $API_PID
    exit 1
fi

# 创建前端配置
echo "创建前端配置文件..."
FRP_URL="http://$SUBDOMAIN.frp.104300.xyz"
mkdir -p src/config
cat > src/config/ragApiConfig.js << EOF
// 由start_rag_with_frp.sh自动生成
const RAG_API_URL = "$FRP_URL";
export default RAG_API_URL;
EOF

# 修改前端代码以使用配置文件中的URL
python3 -c "
import re
file_path='src/components/ChatInterface.js'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

import_line = 'import RAG_API_URL from \"../config/ragApiConfig\";'
if import_line not in content:
    content = content.replace('import AIAvatar from \"./AIAvatar\";', 
                            'import AIAvatar from \"./AIAvatar\";\nimport RAG_API_URL from \"../config/ragApiConfig\";')
    content = re.sub(r'baseURL: \'http://localhost:8000\',', 'baseURL: RAG_API_URL,', content)
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print('已更新ChatInterface.js以使用动态RAG API URL')
"

echo "==================================="
echo "系统启动成功!"
echo "==================================="
echo "RAG API服务器: http://localhost:8000"
echo "公网访问地址: $FRP_URL"
echo ""
echo "服务进程ID:"
echo "API服务器: $API_PID"
echo "frp客户端: $FRP_PID"
echo ""
echo "请保持此终端开启，按Ctrl+C终止服务"

# 保存进程ID，以便后续可以停止服务
echo "$API_PID $FRP_PID" > temp/rag_frp.pid

# 等待用户中断
trap "echo '正在停止服务...'; kill \$(cat temp/rag_frp.pid); rm temp/rag_frp.pid; echo '服务已停止'; exit 0" INT
while true; do
    sleep 1
done 