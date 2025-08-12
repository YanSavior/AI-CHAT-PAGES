@echo off
echo ========================================
echo 重邮AI问答系统 - Netlify 快速部署脚本
echo ========================================
echo.

echo 🚀 开始部署流程...
echo.

echo 📦 步骤 1: 安装依赖
call npm install
if %errorlevel% neq 0 (
    echo ❌ 依赖安装失败
    pause
    exit /b 1
)
echo ✅ 依赖安装完成
echo.

echo 🔧 步骤 2: 执行构建
call npm run build:netlify
if %errorlevel% neq 0 (
    echo ❌ 构建失败
    pause
    exit /b 1
)
echo ✅ 构建完成
echo.

echo 📁 步骤 3: 检查构建文件
if not exist "build\index.html" (
    echo ❌ 构建文件不完整
    pause
    exit /b 1
)
echo ✅ 构建文件检查通过
echo.

echo 📊 构建统计:
for /f %%i in ('dir build /s /-c ^| find "个文件"') do echo   文件数量: %%i
for /f "tokens=3" %%i in ('dir build /s /-c ^| find "字节"') do echo   总大小: %%i 字节
echo.

echo 🎯 部署准备完成！
echo.
echo 📋 接下来的步骤:
echo   1. 将代码推送到 GitHub
echo   2. 在 Netlify 中连接你的仓库
echo   3. 设置构建命令: npm run build:netlify
echo   4. 设置发布目录: build
echo   5. 配置环境变量 (见 .env.example)
echo   6. 点击部署
echo.
echo 🔗 有用的链接:
echo   - Netlify: https://netlify.com
echo   - 部署指南: NETLIFY_DEPLOYMENT_GUIDE.md
echo   - 检查清单: DEPLOYMENT_CHECKLIST.md
echo.

echo 🎉 准备工作完成！现在可以部署到 Netlify 了！
echo.
pause