@echo off
echo Starting PhysioAssist Backend and Desktop App...

set PATH=C:\Program Files\nodejs;%PATH%
cd /d "%~dp0"

echo 1. Starting Python AI Engine in background...
start /b cmd /c ".\venv\Scripts\python.exe server.py"

echo 2. Launching Desktop Interface...
cd frontend
call "C:\Program Files\nodejs\npm.cmd" run start

echo 3. Cleaning up...
taskkill /F /IM python.exe /T >nul 2>&1
exit

