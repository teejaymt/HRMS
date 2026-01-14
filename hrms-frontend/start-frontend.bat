@echo off
REM HRMS Frontend Startup Script
REM Starts the Next.js frontend server on port 3001

echo ========================================
echo   HRMS Frontend Server Startup
echo ========================================
echo.
echo Starting frontend on port 3001...
echo.

set PORT=3001
npm run dev

pause
