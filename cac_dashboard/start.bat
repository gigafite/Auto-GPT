@echo off
REM CAC Dashboard Startup Script for Windows

echo Starting CAC Dashboard...
echo.

REM Start backend
echo Starting Backend Server...
cd backend
python -m venv venv
call venv\Scripts\activate
pip install -q -r requirements.txt
start /B python main.py
cd ..

REM Wait for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend
echo Starting Frontend Application...
cd frontend
call npm install
copy .env.example .env
start /B npm start
cd ..

echo.
echo CAC Dashboard is starting...
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
echo API Docs: http://localhost:8000/docs
echo.
echo Press Ctrl+C to stop
echo.

pause
