#!/bin/bash
set -e
echo "============================================"
echo "  至远药业 经营数据看板"
echo "============================================"
echo ""

echo "启动后端 (FastAPI :8000)..."
cd backend
python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
cd ..

sleep 2

echo "启动前端 (Vite :5173)..."
npm run dev &
FRONTEND_PID=$!

# Open browser
if command -v open &> /dev/null; then
    open http://localhost:5173
elif command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:5173
fi

echo ""
echo "后端 PID: $BACKEND_PID"
echo "前端 PID: $FRONTEND_PID"
echo "按 Ctrl+C 停止所有服务"

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" SIGINT SIGTERM
wait
