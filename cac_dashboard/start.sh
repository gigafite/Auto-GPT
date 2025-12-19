#!/bin/bash

# CAC Dashboard Startup Script

echo "Starting CAC Dashboard..."
echo ""

# Start backend
echo "Starting Backend Server..."
cd backend
python -m venv venv 2>/dev/null || true
source venv/bin/activate
pip install -q -r requirements.txt
python main.py &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 3

# Start frontend
echo "Starting Frontend Application..."
cd frontend
npm install --silent 2>/dev/null || true
cp .env.example .env 2>/dev/null || true
npm start &
FRONTEND_PID=$!
cd ..

echo ""
echo "CAC Dashboard is starting..."
echo "Backend: http://localhost:8000"
echo "Frontend: http://localhost:3000"
echo "API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop all services"

# Trap Ctrl+C and cleanup
trap "echo 'Stopping services...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT

# Wait for processes
wait
