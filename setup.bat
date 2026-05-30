@echo off
chcp 65001 >nul
title 至远药业看板 — 环境安装

echo ============================================
echo   至远药业 经营数据看板 — 一键安装
echo ============================================
echo.

:: ── Node.js ──
echo [1/4] 检查 Node.js...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未找到 Node.js，请先安装: https://nodejs.org/
    pause
    exit /b 1
)
echo Node.js 已就绪:
node -v

:: ── npm install ──
echo.
echo [2/4] 安装前端依赖...
call npm install
if %errorlevel% neq 0 (
    echo [错误] npm install 失败
    pause
    exit /b 1
)

:: ── Python ──
echo.
echo [3/4] 检查 Python...
where python >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未找到 Python，请先安装 Python 3.11+: https://www.python.org/downloads/
    pause
    exit /b 1
)
echo Python 已就绪:
python --version

:: ── pip install ──
echo.
echo [4/4] 安装 Python 依赖...
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo [错误] pip install 失败，尝试使用 pip3...
    pip3 install -r requirements.txt
)

:: ── 目录 ──
if not exist "backend\uploads" mkdir backend\uploads
if not exist "backend\data" mkdir backend\data

echo.
echo ============================================
echo   安装完成！双击 start.bat 启动系统
echo ============================================
pause
