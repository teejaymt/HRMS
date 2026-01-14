@echo off
title HRMS System Launcher
color 0A

echo ========================================
echo    HRMS System - Starting Services
echo ========================================
echo.

echo [1/2] Starting Backend Server...
start "HRMS Backend" cmd /k "cd /d %~dp0hrms-backend && color 0B && echo HRMS Backend Server && echo ===================== && npm run start:dev"

echo       Waiting 8 seconds for backend to initialize...
timeout /t 8 /nobreak > nul

echo.
echo [2/2] Starting Frontend Server...
start "HRMS Frontend" cmd /k "cd /d %~dp0hrms-frontend && color 0C && echo HRMS Frontend Server && echo ====================== && npm run dev -- --turbo false"

echo.
echo ========================================
echo    HRMS System Started Successfully!
echo ========================================
echo.
echo Backend API:  http://localhost:3000
echo Frontend UI:  http://localhost:3001
echo.
echo Two terminal windows have been opened:
echo   - Blue window  = Backend Server
echo   - Red window   = Frontend Server
echo.
echo Press any key to close this launcher...
pause > nul
