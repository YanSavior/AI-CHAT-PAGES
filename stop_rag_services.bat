@echo off
echo ===================================
echo 停止RAG系统和内网穿透服务
echo ===================================

echo 正在停止所有相关进程...

:: 停止frpc进程
taskkill /f /im frpc.exe 2>nul
if %errorlevel% equ 0 (
    echo [成功] 已停止frp客户端
) else (
    echo [信息] 未发现运行中的frp客户端
)

:: 停止Python进程（API服务器）
:: 注意：这会停止所有Python进程，如果有其他Python应用请谨慎使用
for /f "tokens=2" %%a in ('tasklist /fi "imagename eq python.exe" /fo list ^| find "PID:"') do (
    taskkill /f /pid %%a 2>nul
)
for /f "tokens=2" %%a in ('tasklist /fi "imagename eq pythonw.exe" /fo list ^| find "PID:"') do (
    taskkill /f /pid %%a 2>nul
)
echo [成功] 已停止Python进程

:: 清理临时文件
if exist temp\frp.log del /f /q temp\frp.log
if exist temp\api_server.log del /f /q temp\api_server.log
if exist temp\rag_frp.pid del /f /q temp\rag_frp.pid
echo [成功] 已清理临时文件

echo ===================================
echo 所有服务已停止
echo ===================================
pause 