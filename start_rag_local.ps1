# RAG系统本地快速启动脚本
# 使用方法：右键 -> "使用PowerShell运行"

Write-Host "🚀 RAG系统本地快速启动" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green

# 检查Python
Write-Host "`n检查Python环境..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✅ Python版本: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ 未找到Python，请先安装Python 3.8+" -ForegroundColor Red
    Read-Host "按回车键退出"
    exit 1
}

# 检查依赖
Write-Host "`n检查依赖包..." -ForegroundColor Yellow
try {
    pip install -r requirements.txt --quiet
    Write-Host "✅ 依赖包检查完成" -ForegroundColor Green
} catch {
    Write-Host "⚠️  依赖包安装失败，尝试继续启动..." -ForegroundColor Yellow
}

# 启动API服务器
Write-Host "`n启动RAG API服务器..." -ForegroundColor Yellow
Write-Host "服务器将在 http://localhost:8000 启动" -ForegroundColor Cyan
Write-Host "按 Ctrl+C 停止服务器" -ForegroundColor Cyan

# 启动服务器
Start-Process -FilePath "python" -ArgumentList "api_server.py" -WindowStyle Normal

# 等待服务器启动
Write-Host "`n等待服务器启动..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# 检查服务器状态
Write-Host "`n检查服务器状态..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8000/api/health" -Method Get -TimeoutSec 10
    Write-Host "✅ 服务器启动成功！" -ForegroundColor Green
    Write-Host "   状态: $($response.status)" -ForegroundColor Cyan
    Write-Host "   RAG系统初始化: $($response.rag_system_initialized)" -ForegroundColor Cyan
} catch {
    Write-Host "⚠️  服务器可能未完全启动，请稍等片刻" -ForegroundColor Yellow
}

# 显示访问信息
Write-Host "`n🎉 部署完成！" -ForegroundColor Green
Write-Host "`n📍 访问地址:" -ForegroundColor Cyan
Write-Host "   本地地址: http://localhost:8000" -ForegroundColor White
Write-Host "   API文档: http://localhost:8000/docs" -ForegroundColor White
Write-Host "   健康检查: http://localhost:8000/api/health" -ForegroundColor White

Write-Host "`n💡 使用说明:" -ForegroundColor Cyan
Write-Host "1. 在浏览器中访问上述地址" -ForegroundColor White
Write-Host "2. 使用API文档测试接口" -ForegroundColor White
Write-Host "3. 运行 test_local_deployment.py 进行完整测试" -ForegroundColor White

Write-Host "`n🌐 如需公网访问，请:" -ForegroundColor Cyan
Write-Host "1. 安装ngrok: https://ngrok.com/" -ForegroundColor White
Write-Host "2. 运行: ngrok http 8000" -ForegroundColor White
Write-Host "3. 使用生成的公网地址" -ForegroundColor White

Write-Host "`n按回车键退出..." -ForegroundColor Yellow
Read-Host 