@echo off
chcp 65001 >nul
title 至远药业看板

echo ============================================
echo   至远药业 经营数据看板
echo ============================================
echo.

echo 启动后端服务 (FastAPI :8000)...
start "BL-Backend" cmd /c "cd backend && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000"

echo 等待后端启动...
timeout /t 2 /nobreak >nul

echo 启动前端服务 (Vite :5173)...
start http://localhost:5173
call npm run dev

pause
