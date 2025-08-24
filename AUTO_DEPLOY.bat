@echo off
chcp 65001 >nul
echo ========================================
echo 🚀 重邮AI问答系统 - 自动部署脚本
echo ========================================
echo.

echo 📋 开始自动部署流程...
echo.

echo 🔍 步骤 1: 检查Git状态
git status --porcelain
if %errorlevel% neq 0 (
    echo ❌ Git状态检查失败
    pause
    exit /b 1
)
echo ✅ Git状态检查完成
echo.

echo 📦 步骤 2: 添加所有文件到Git
git add .
if %errorlevel% neq 0 (
    echo ❌ 添加文件失败
    pause
    exit /b 1
)
echo ✅ 文件添加完成
echo.

echo 💾 步骤 3: 提交更改
git commit -m "Ready for Netlify deployment with Dify integration - %date% %time%"
if %errorlevel% neq 0 (
    echo ⚠️ 提交可能失败（可能没有新更改）
)
echo ✅ 提交完成
echo.

echo 🌐 步骤 4: 推送到远程仓库
git push origin main
if %errorlevel% neq 0 (
    echo ❌ 推送失败，请检查网络连接和权限
    echo 💡 提示: 可能需要设置GitHub访问令牌
    pause
    exit /b 1
)
echo ✅ 推送完成
echo.

echo 🔧 步骤 5: 最终构建验证
call npm run build:netlify
if %errorlevel% neq 0 (
    echo ❌ 最终构建失败
    pause
    exit /b 1
)
echo ✅ 最终构建成功
echo.

echo 🎉 自动部署准备完成！
echo.
echo 📋 接下来的手动步骤:
echo   1. 访问 https://netlify.com
echo   2. 点击 "New site from Git"
echo   3. 选择你的GitHub仓库
echo   4. 配置构建设置:
echo      - Build command: npm run build:netlify
echo      - Publish directory: build
echo      - Node version: 18
echo   5. 设置环境变量:
echo      - REACT_APP_DEEPSEEK_API_KEY=sk-7f5214ed15764dfea0b45c84c6d0c961
echo   6. 点击 "Deploy site"
echo.
echo 🔗 有用的链接:
echo   - Netlify: https://netlify.com
echo   - 快速指南: QUICK_DEPLOY_GUIDE.md
echo   - 详细文档: NETLIFY_COMPLETE_DEPLOYMENT.md
echo.
echo 📊 构建统计:
dir build /s /-c | find "个文件"
echo.
echo 🎊 准备就绪！现在可以在Netlify上完成部署了！
echo.
pause
