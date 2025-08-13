@echo off
echo 🚀 开始部署RAG API到Vercel...
echo.

echo 📋 检查必需文件...
if not exist "api_server_vercel.py" (
    echo ❌ 错误：api_server_vercel.py 文件不存在
    pause
    exit /b 1
)

if not exist "vercel.json" (
    echo ❌ 错误：vercel.json 文件不存在
    pause
    exit /b 1
)

if not exist "requirements.txt" (
    echo ❌ 错误：requirements.txt 文件不存在
    pause
    exit /b 1
)

echo ✅ 所有必需文件存在

echo.
echo 🔧 安装Vercel CLI (如果未安装)...
npm list -g @vercel/cli >nul 2>&1
if errorlevel 1 (
    echo 正在安装Vercel CLI...
    npm install -g @vercel/cli
    if errorlevel 1 (
        echo ❌ 错误：Vercel CLI安装失败
        pause
        exit /b 1
    )
)

echo ✅ Vercel CLI已准备就绪

echo.
echo 🚀 开始部署...
vercel --prod

echo.
echo 🎉 部署完成！
echo 📝 请记录Vercel提供的URL，并在前端配置中使用
echo.
pause