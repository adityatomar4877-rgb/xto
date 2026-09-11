@echo off
title XTO Backend Server
echo Starting XTO Cyber Decision Digital Twin Backend on http://127.0.0.1:9229 ...
cd backend
if not exist .venv (
    echo Creating Python virtual environment...
    python -m venv .venv
    call .venv\Scripts\activate
    pip install -r requirements.txt
) else (
    call .venv\Scripts\activate
)
python -m uvicorn app.main:app --host 127.0.0.1 --port 9229 --reload
pause
