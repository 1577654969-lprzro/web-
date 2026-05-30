#!/bin/bash
set -e
echo "============================================"
echo "  至远药业 经营数据看板 — 一键安装"
echo "============================================"
echo ""

# Node.js
echo "[1/4] 检查 Node.js..."
if ! command -v node &> /dev/null; then
    echo "[错误] 未找到 Node.js，请先安装: https://nodejs.org/"
    exit 1
fi
echo "Node.js: $(node -v)"

# npm install
echo "[2/4] 安装前端依赖..."
npm install

# Python
echo "[3/4] 检查 Python..."
if ! command -v python3 &> /dev/null; then
    echo "[错误] 未找到 Python，请安装 Python 3.11+"
    exit 1
fi
echo "Python: $(python3 --version)"

# pip install
echo "[4/4] 安装 Python 依赖..."
pip3 install -r requirements.txt || pip install -r requirements.txt

# dirs
mkdir -p backend/uploads backend/data

echo ""
echo "============================================"
echo "  安装完成！运行 ./start.sh 启动系统"
echo "============================================"
