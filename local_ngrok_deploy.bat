@echo off
chcp 65001
echo 🚀 RAG系统本地+ngrok部署脚本
echo ================================

echo.
echo 检查Python环境...
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 错误：未找到Python，请先安装Python 3.8+
    pause
    exit /b 1
)

echo.
echo 检查pip...
pip --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 错误：未找到pip，请先安装pip
    pause
    exit /b 1
)

echo.
echo 安装依赖包...
pip install -r requirements.txt
if errorlevel 1 (
    echo ❌ 错误：依赖安装失败
    pause
    exit /b 1
)

echo.
echo 检查ngrok...
ngrok --version >nul 2>&1
if errorlevel 1 (
    echo ⚠️  警告：未找到ngrok
    echo.
    echo 请按照以下步骤安装ngrok：
    echo 1. 访问 https://ngrok.com/
    echo 2. 注册免费账号
    echo 3. 下载ngrok
    echo 4. 解压到当前目录或添加到PATH
    echo 5. 运行 'ngrok config add-authtoken YOUR_TOKEN'
    echo.
    echo 或者使用以下命令下载（需要curl）：
    echo curl -O https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-windows-amd64.zip
    echo.
    pause
    echo.
    echo 是否继续启动本地服务器？(y/n)
    set /p continue=
    if /i not "%continue%"=="y" goto exit
)

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
if exist ngrok.exe (
    echo 启动ngrok隧道...
    echo 公网地址将显示在ngrok窗口中
    echo.
    start "ngrok Tunnel" cmd /k "ngrok http 8000"
    
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
) else (
    echo ⚠️  未找到ngrok，仅启动本地服务器
    echo.
    echo 📍 本地地址: http://localhost:8000
    echo 📚 API文档: http://localhost:8000/docs
)

echo.
echo 按任意键退出...
pause >nul

:exit
echo 退出部署脚本 