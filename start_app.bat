@echo off
echo Starting RehabAI Backend and Desktop App...

cd /d "%~dp0"

echo 1. Starting Python AI Engine in background...
start /b cmd /c ".\venv\Scripts\python.exe server.py"

echo 2. Launching Desktop Interface...
cd frontend
call npm run start

echo 3. Cleaning up...
taskkill /F /IM python.exe /T >nul 2>&1
exit
