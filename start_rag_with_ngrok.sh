#!/bin/bash

echo "==================================="
echo "启动RAG系统和ngrok服务"
echo "==================================="

# 检查Python是否安装
if ! command -v python3 &> /dev/null; then
    echo "[错误] 未检测到Python，请确保已安装Python 3"
    exit 1
fi

# 检查ngrok是否安装
if ! command -v ngrok &> /dev/null; then
    echo "[错误] 未检测到ngrok，请确保已安装ngrok并添加到PATH"
    exit 1
fi

# 检查是否已登录ngrok
if ! ngrok config check &> /dev/null; then
    echo "[警告] 请确保已登录ngrok，否则可能无法正常启动"
    echo "可以使用 'ngrok config add-authtoken YOUR_TOKEN' 进行登录"
    sleep 5
fi

# 创建临时目录
mkdir -p temp

# 在后台启动RAG系统API服务器
echo "[1/4] 启动RAG系统API服务器..."
python3 api_server.py > temp/api_server.log 2>&1 &
API_PID=$!

# 等待API服务器启动
echo "[2/4] 等待API服务器启动..."
sleep 5

# 检查API服务器是否正常启动
if ! ps -p $API_PID > /dev/null; then
    echo "[错误] API服务器启动失败，请检查temp/api_server.log"
    exit 1
fi

# 启动ngrok隧道
echo "[3/4] 启动ngrok隧道..."
ngrok http 8000 --log=stdout > temp/ngrok.log 2>&1 &
NGROK_PID=$!

# 等待ngrok隧道建立
echo "等待ngrok隧道建立..."
sleep 5

# 检查ngrok是否正常启动
if ! ps -p $NGROK_PID > /dev/null; then
    echo "[错误] ngrok启动失败，请检查temp/ngrok.log"
    kill $API_PID
    exit 1
fi

# 提取ngrok公网URL
echo "[4/4] 提取ngrok公网URL并更新前端配置..."
python3 -c "
import re
import json
import os

try:
    with open('temp/ngrok.log', 'r', encoding='utf-8') as f:
        content = f.read()
    
    match = re.search(r'url=(https://[^\s]+)', content)
    url = match.group(1) if match else None
    
    if url:
        print(f'找到ngrok URL: {url}')
        
        # 创建配置目录
        os.makedirs('src/config', exist_ok=True)
        
        # 写入配置文件
        js_content = f'// 由start_rag_with_ngrok.sh自动生成\\nconst RAG_API_URL = \"{url}\";\\nexport default RAG_API_URL;'
        with open('src/config/ragApiConfig.js', 'w', encoding='utf-8') as f:
            f.write(js_content)
        
        print('已更新前端配置文件: src/config/ragApiConfig.js')
        
        # 修改前端代码以使用配置文件中的URL
        file_path = 'src/components/ChatInterface.js'
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        import_line = 'import RAG_API_URL from \"../config/ragApiConfig\";'
        if import_line not in content:
            content = content.replace('import AIAvatar from \"./AIAvatar\";', 
                                     'import AIAvatar from \"./AIAvatar\";\\nimport RAG_API_URL from \"../config/ragApiConfig\";')
            content = re.sub(r'baseURL: \'http://localhost:8000\',', 'baseURL: RAG_API_URL,', content)
            
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            
            print('已更新ChatInterface.js以使用动态RAG API URL')
    else:
        print('[错误] 未找到ngrok URL，请检查ngrok是否正常启动')
        exit(1)
except Exception as e:
    print(f'[错误] 更新配置失败: {str(e)}')
    exit(1)
"

# 检查是否成功
if [ $? -ne 0 ]; then
    echo "[错误] 提取ngrok URL失败，请检查ngrok是否正常启动"
    kill $API_PID $NGROK_PID
    exit 1
fi

echo "==================================="
echo "系统启动成功!"
echo "==================================="
echo "RAG API服务器: http://localhost:8000"
echo "公网访问地址: 见src/config/ragApiConfig.js"
echo ""
echo "服务进程ID:"
echo "API服务器: $API_PID"
echo "ngrok隧道: $NGROK_PID"
echo ""
echo "请保持此终端开启，按Ctrl+C终止服务"

# 保存进程ID，以便后续可以停止服务
echo "$API_PID $NGROK_PID" > temp/rag_ngrok.pid

# 等待用户中断
trap "echo '正在停止服务...'; kill \$(cat temp/rag_ngrok.pid); rm temp/rag_ngrok.pid; echo '服务已停止'; exit 0" INT
while true; do
    sleep 1
done 