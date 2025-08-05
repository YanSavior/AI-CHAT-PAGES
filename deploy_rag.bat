@echo off
chcp 65001
echo 🚀 RAG API 部署脚本
echo ==================

echo.
echo 选择部署平台：
echo 1. Railway (推荐)
echo 2. Render
echo 3. 退出
echo.
set /p choice=请输入选择 (1-3): 

if "%choice%"=="1" goto railway
if "%choice%"=="2" goto render
if "%choice%"=="3" goto exit
goto invalid

:railway
echo.
echo 部署到 Railway...
echo.
echo 请按照以下步骤操作：
echo 1. 访问 https://railway.app
echo 2. 使用GitHub账号登录
echo 3. 点击 "New Project"
echo 4. 选择 "Deploy from GitHub repo"
echo 5. 选择您的GitHub仓库
echo 6. 等待部署完成
echo 7. 复制生成的域名
echo.
echo 部署完成后，请更新前端代码中的API地址：
echo 将 'https://your-rag-api.railway.app' 替换为实际的Railway域名
echo.
pause
goto exit

:render
echo.
echo 部署到 Render...
echo.
echo 请按照以下步骤操作：
echo 1. 访问 https://render.com
echo 2. 使用GitHub账号登录
echo 3. 点击 "New +" 选择 "Web Service"
echo 4. 连接您的GitHub仓库
echo 5. 设置以下配置：
echo    - Name: rag-api
echo    - Environment: Python 3
echo    - Build Command: pip install -r requirements.txt
echo    - Start Command: uvicorn api_server:app --host 0.0.0.0 --port %%PORT%%
echo 6. 点击 "Create Web Service"
echo 7. 等待部署完成
echo 8. 复制生成的域名
echo.
pause
goto exit

:invalid
echo 无效选择，请重新运行脚本
pause
goto exit

:exit
echo 退出部署
pause 