@echo off
chcp 65001
echo 🚀 RAG系统部署脚本（指定ngrok路径）
echo ======================================

echo.
echo 检查Python环境...
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 错误：未找到Python
    pause
    exit /b 1
)

echo.
echo 检查依赖包...
python -c "import fastapi, uvicorn, sentence_transformers, chromadb" >nul 2>&1
if errorlevel 1 (
    echo ❌ 错误：依赖包未安装，请先运行 deploy_py313.bat
    pause
    exit /b 1
)

echo.
echo 设置ngrok路径...
set NGROK_PATH=E:\Projects\ngrok-v3-stable-windows-amd64\ngrok.exe

echo 检查ngrok...
if not exist "%NGROK_PATH%" (
    echo ❌ 错误：ngrok未找到在 %NGROK_PATH%
    echo 请检查ngrok安装路径
    pause
    exit /b 1
)

echo ✅ 找到ngrok: %NGROK_PATH%

echo.
echo 启动RAG API服务器...
echo 服务器将在 http://localhost:8000 启动
echo.
echo 按 Ctrl+C 停止服务器
echo.

start "RAG API Server" cmd /k "python api_server.py"

echo.
echo 等待服务器启动...
timeout /t 5 /nobreak >nul

echo.
echo 检查服务器状态...
curl -s http://localhost:8000/api/health >nul 2>&1
if errorlevel 1 (
    echo ⚠️  警告：服务器可能未完全启动，请稍等片刻
) else (
    echo ✅ 服务器启动成功！
)

echo.
echo 启动ngrok隧道...
echo 公网地址将显示在ngrok窗口中
echo.

start "ngrok Tunnel" cmd /k ""%NGROK_PATH%" http 8000"

echo.
echo 🎉 部署完成！
echo.
echo 📍 本地地址: http://localhost:8000
echo 🌐 公网地址: 查看ngrok窗口
echo 📚 API文档: http://localhost:8000/docs
echo.
echo 💡 使用说明：
echo 1. 本地访问: http://localhost:8000
echo 2. 公网访问: 使用ngrok生成的地址
echo 3. 测试API: http://localhost:8000/api/health
echo 4. 查询接口: POST http://localhost:8000/api/query
echo.
echo ⚠️  注意：ngrok免费版每次重启会生成新的公网地址
echo.
echo 🔧 如果ngrok需要认证，请运行：
echo "%NGROK_PATH%" config add-authtoken YOUR_TOKEN
echo.
echo 按任意键退出...
pause >nul 