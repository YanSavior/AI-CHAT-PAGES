@echo off
echo ========================================
echo 重邮AI问答系统 - 手动部署到Netlify
echo ========================================
echo.

echo ⚠️  注意：推荐使用Git连接方式部署
echo    手动部署将失去自动更新和环境变量管理功能
echo.

set /p confirm="确定要继续手动部署吗？(y/N): "
if /i not "%confirm%"=="y" (
    echo 已取消部署
    pause
    exit /b 0
)

echo.
echo 📦 步骤 1: 安装Netlify CLI
call npm install -g netlify-cli
if %errorlevel% neq 0 (
    echo ❌ Netlify CLI安装失败
    pause
    exit /b 1
)

echo.
echo 🔧 步骤 2: 构建项目
call npm run build:netlify
if %errorlevel% neq 0 (
    echo ❌ 项目构建失败
    pause
    exit /b 1
)

echo.
echo 🚀 步骤 3: 部署到Netlify
echo    请按照提示登录Netlify账户
call netlify deploy --prod --dir=build
if %errorlevel% neq 0 (
    echo ❌ 部署失败
    pause
    exit /b 1
)

echo.
echo ✅ 部署完成！
echo.
echo ⚠️  重要提醒：
echo   1. 手动部署无法使用环境变量，API密钥已硬编码
echo   2. 每次更新都需要重新运行此脚本
echo   3. 建议改用Git连接方式以获得完整功能
echo.
pause