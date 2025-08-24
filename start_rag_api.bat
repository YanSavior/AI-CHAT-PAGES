@echo off
echo 🚀 启动RAG API服务器...
echo.

echo 📋 检查Python环境...
python --version
if errorlevel 1 (
    echo ❌ 错误：Python未安装或不在PATH中
    pause
    exit /b 1
)

echo.
echo 📦 安装依赖包...
pip install -r requirements.txt
if errorlevel 1 (
    echo ❌ 错误：依赖安装失败
    pause
    exit /b 1
)

echo.
echo 🔧 设置环境变量...
set RAGFLOW_API_URL=http://localhost:9380
set RAGFLOW_TOKEN=
set HOST=0.0.0.0
set PORT=8000

echo.
echo 🚀 启动服务器...
echo 📍 服务地址: http://localhost:8000
echo 📚 API文档: http://localhost:8000/docs
echo 🔗 RAGflow地址: %RAGFLOW_API_URL%
echo.
echo 按 Ctrl+C 停止服务器
echo.

python rag_api_server.py