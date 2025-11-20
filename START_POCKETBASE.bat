@echo off
REM PocketBase Startup Script for Windows
REM This script starts PocketBase and initializes collections

echo.
echo ========================================
echo   MANTENTE - PocketBase Startup
echo ========================================
echo.

REM Check if pocketbase.exe exists
if not exist "pocketbase.exe" (
    echo ERROR: pocketbase.exe not found in current directory
    echo.
    echo Please ensure you are running this script from:
    echo %cd%
    pause
    exit /b 1
)

REM Start PocketBase in a new window
echo Starting PocketBase server...
start "PocketBase Server" cmd /k "pocketbase.exe serve --http=127.0.0.1:8090"

REM Wait for PocketBase to start
echo.
echo Waiting for PocketBase to start (5 seconds)...
timeout /t 5 /nobreak

REM Initialize collections
echo.
echo Initializing collections...
cd pocketbase-server
call npm run dev

pause
