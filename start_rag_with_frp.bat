@echo off
setlocal enabledelayedexpansion

echo ===================================
echo 启动RAG系统和frp内网穿透服务
echo ===================================

:: 检查Python是否安装
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未检测到Python，请确保已安装Python并添加到PATH
    goto :error
)

:: 检查frp客户端是否存在
set FRP_PATH=frpc.exe
if not exist "%FRP_PATH%" (
    echo [警告] 未在当前目录找到frpc.exe，请确认frp客户端位置
    set /p FRP_PATH="请输入frpc.exe的完整路径: "
    if not exist "!FRP_PATH!" (
        echo [错误] 未找到frpc.exe: !FRP_PATH!
        goto :error
    )
)

:: 检查frp配置文件
if not exist "frpc.ini" (
    echo [错误] 未找到frpc.ini配置文件
    goto :error
)

:: 修改frp配置中的子域名
set /p SUBDOMAIN="请输入您想使用的子域名前缀 (例如: myrag): "
if "!SUBDOMAIN!"=="" set SUBDOMAIN=rag-%RANDOM%

echo [信息] 将使用子域名: !SUBDOMAIN!.frp.104300.xyz

:: 更新frpc.ini中的子域名
powershell -Command "(Get-Content frpc.ini) -replace 'your-subdomain', '!SUBDOMAIN!' | Set-Content frpc.ini"

:: 创建临时目录
if not exist temp mkdir temp

:: 在后台启动RAG系统API服务器
echo [1/3] 启动RAG系统API服务器...
start "RAG API Server" cmd /c "python api_server.py > temp\api_server.log 2>&1"

:: 等待API服务器启动
echo [2/3] 等待API服务器启动...
timeout /t 5

:: 启动frp客户端
echo [3/3] 启动frp内网穿透...
start "FRP Client" cmd /c "!FRP_PATH! -c frpc.ini > temp\frp.log 2>&1"

:: 等待frp连接建立
echo 等待frp隧道建立...
timeout /t 5

:: 创建前端配置
echo 创建前端配置文件...
set FRP_URL=http://!SUBDOMAIN!.frp.104300.xyz
echo // 由start_rag_with_frp.bat自动生成 > src\config\ragApiConfig.js
echo const RAG_API_URL = "%FRP_URL%"; >> src\config\ragApiConfig.js
echo export default RAG_API_URL; >> src\config\ragApiConfig.js

:: 修改前端代码以使用配置文件中的URL
python -c "import re; file_path='src/components/ChatInterface.js'; with open(file_path, 'r', encoding='utf-8') as f: content=f.read(); import_line='import RAG_API_URL from \"../config/ragApiConfig\";'; if import_line not in content: content=content.replace('import AIAvatar from \"./AIAvatar\";', 'import AIAvatar from \"./AIAvatar\";\nimport RAG_API_URL from \"../config/ragApiConfig\";'); content=re.sub(r'baseURL: \'http://localhost:8000\',', 'baseURL: RAG_API_URL,', content); with open(file_path, 'w', encoding='utf-8') as f: f.write(content); print('已更新ChatInterface.js以使用动态RAG API URL');"

echo ===================================
echo 系统启动成功!
echo ===================================
echo RAG API服务器: http://localhost:8000
echo 公网访问地址: %FRP_URL%
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