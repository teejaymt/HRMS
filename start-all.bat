@echo off
REM HRMS Full Application Startup Script
REM Starts both Backend and Frontend servers

echo ========================================
echo   HRMS Application Startup
echo ========================================
echo.
echo This will start:
echo   - Backend (NestJS) on port 3000
echo   - Frontend (Next.js) on port 3001
echo.
echo ========================================
echo.

REM Start Backend in new window
start "HRMS Backend - Port 3000" cmd /k "cd /d %~dp0hrms-backend && start-backend.bat"

REM Wait 3 seconds for backend to initialize
timeout /t 3 /nobreak > nul

REM Start Frontend in new window
start "HRMS Frontend - Port 3001" cmd /k "cd /d %~dp0hrms-frontend && start-frontend.bat"

echo.
echo ========================================
echo   Services Starting...
echo ========================================
echo.
echo Backend:  http://localhost:3000
echo Frontend: http://localhost:3001
echo.
echo Both services are starting in separate windows.
echo Close this window or press any key to continue...
echo.

pause
