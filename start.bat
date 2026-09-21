@echo off
cd /d "%~dp0"
echo Starting Clarity Backend (FastAPI)...
start "Clarity Backend" cmd /k "cd /d "%~dp0" && python -m uvicorn server.main:app --reload --port 8000"

echo Starting Clarity Frontend (Next.js)...
start "Clarity Frontend" cmd /k "cd /d "%~dp0client" && npm run dev"

echo Clarity is starting up in new windows!
