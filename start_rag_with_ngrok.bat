@echo off
setlocal enabledelayedexpansion

echo ===================================
echo 启动RAG系统和ngrok服务
echo ===================================

:: 设置ngrok完整路径
set NGROK_PATH=E:\Projects\ngrok-v3-stable-windows-amd64\ngrok.exe
if not exist "%NGROK_PATH%" (
    echo [错误] 未找到ngrok.exe，请确认路径: %NGROK_PATH%
    goto :error
)

:: 检查Python是否安装
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未检测到Python，请确保已安装Python并添加到PATH
    goto :error
)

:: 检查ngrok是否已登录
"%NGROK_PATH%" config check >nul 2>&1
if %errorlevel% neq 0 (
    echo [警告] 请确保已登录ngrok，否则可能无法正常启动
    echo 可以使用 '%NGROK_PATH% config add-authtoken YOUR_TOKEN' 进行登录
    timeout /t 5
)

:: 创建临时目录
if not exist temp mkdir temp

:: 在后台启动RAG系统API服务器
echo [1/4] 启动RAG系统API服务器...
start "RAG API Server" cmd /c "python api_server.py"

:: 等待API服务器启动
echo [2/4] 等待API服务器启动...
timeout /t 5

:: 启动ngrok隧道
echo [3/4] 启动ngrok隧道...
start "Ngrok Tunnel" cmd /c ""%NGROK_PATH%" http 8000 --log=stdout > temp\ngrok.log"

:: 等待ngrok隧道建立
echo 等待ngrok隧道建立...
timeout /t 5

:: 提取ngrok公网URL
echo [4/4] 提取ngrok公网URL并更新前端配置...
python -c "import re; import json; import os; f=open('temp\\ngrok.log', 'r', encoding='utf-8'); content=f.read(); f.close(); match=re.search(r'url=(https://[^\\s]+)', content); url=match.group(1) if match else None; print(f'找到ngrok URL: {url}' if url else '未找到ngrok URL'); js_content=f'// 由start_rag_with_ngrok.bat自动生成\nconst RAG_API_URL = \"{url}\";\nexport default RAG_API_URL;'; os.makedirs('src/config', exist_ok=True); f=open('src/config/ragApiConfig.js', 'w', encoding='utf-8'); f.write(js_content); f.close(); print('已更新前端配置文件: src/config/ragApiConfig.js');"

:: 检查是否成功
if %errorlevel% neq 0 (
    echo [错误] 提取ngrok URL失败，请检查ngrok是否正常启动
    goto :error
)

:: 修改前端代码以使用配置文件中的URL
python -c "import re; file_path='src/components/ChatInterface.js'; with open(file_path, 'r', encoding='utf-8') as f: content=f.read(); import_line='import RAG_API_URL from \"../config/ragApiConfig\";'; if import_line not in content: content=content.replace('import AIAvatar from \"./AIAvatar\";', 'import AIAvatar from \"./AIAvatar\";\nimport RAG_API_URL from \"../config/ragApiConfig\";'); content=re.sub(r'baseURL: \'http://localhost:8000\',', 'baseURL: RAG_API_URL,', content); with open(file_path, 'w', encoding='utf-8') as f: f.write(content); print('已更新ChatInterface.js以使用动态RAG API URL');"

echo ===================================
echo 系统启动成功!
echo ===================================
echo RAG API服务器: http://localhost:8000
echo 公网访问地址: 见src/config/ragApiConfig.js
echo.
echo 请保持此窗口开启，关闭窗口将终止服务
echo 按任意键退出...
pause > nul
goto :eof

:error
echo.
echo 启动失败，请检查错误信息
pause
exit /b 1 