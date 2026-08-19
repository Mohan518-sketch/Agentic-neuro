@echo off
echo ============================================
echo   Agentic Neuro - Domain Setup
echo ============================================
echo.

REM Check for admin rights
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [ERROR] This script needs Administrator privileges.
    echo Right-click and select "Run as administrator"
    pause
    exit /b 1
)

REM Add hosts entry
findstr /C:"agenticneuro" C:\Windows\System32\drivers\etc\hosts >nul 2>&1
if %errorLevel% neq 0 (
    echo 127.0.0.1 agenticneuro>> C:\Windows\System32\drivers\etc\hosts
    echo [OK] Added hosts entry: 127.0.0.1 agenticneuro
) else (
    echo [OK] Hosts entry already exists.
)

echo.
echo [OK] Starting Agentic Neuro server on http://agenticneuro ...
echo [OK] Opening browser...
echo.
start "" "http://agenticneuro"
echo Press Ctrl+C to stop the server.
echo.
cd /d "c:\Users\mohan\.gemini\antigravity\scratch\enterprise-repo-dashboard"
python -m http.server 80
