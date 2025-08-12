@echo off
chcp 65001
echo 🚀 RAG系统一键启动脚本
echo ================================

echo.
echo 1. 启动RAG API服务器...
start "RAG API Server" cmd /k "python api_server_custom_models.py"

echo.
echo 2. 等待服务器启动...
timeout /t 10 /nobreak >nul

echo.
echo 3. 启动ngrok隧道...
cd /d "E:\Projects\ngrok-v3-stable-windows-amd64"
start "ngrok Tunnel" cmd /k "ngrok http 8000"

echo.
echo 4. 等待ngrok启动...
timeout /t 5 /nobreak >nul

echo.
echo 5. 获取ngrok地址...
echo 请查看ngrok窗口，获取新的公网地址
echo 然后更新以下文件中的地址：
echo - src/config/ragConfig.js
echo - test_frontend_rag_connection.js
echo.

echo 6. 启动前端应用...
cd /d "E:\Projects\ai-chat-app - 副本"
start "Frontend App" cmd /k "npm start"

echo.
echo 🎉 所有服务启动完成！
echo.
echo 📋 待办事项：
echo 1. 从ngrok窗口复制新的公网地址
echo 2. 更新配置文件中的ngrok地址
echo 3. 构建知识库（如果需要）
echo.
echo 按任意键退出...
pause >nul 