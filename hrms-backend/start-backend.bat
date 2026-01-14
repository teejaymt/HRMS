@echo off
REM HRMS Backend Startup Script
REM Starts the NestJS backend server on port 3000

echo ========================================
echo   HRMS Backend Server Startup
echo ========================================
echo.
echo Starting backend on port 3000...
echo.

set PORT=3000
npm run start:dev

pause
