@echo off
title XTO Cyber War Room Frontend
echo Starting XTO Cyber War Room Frontend on http://localhost:5174 ...
cd frontend
if not exist node_modules (
    echo Installing npm dependencies...
    call npm install
)
call npm run dev
pause
