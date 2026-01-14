@echo off
title HRMS Backend ONLY
color 0B

echo ========================================
echo    Starting HRMS Backend Server
echo ========================================
echo.
echo Checking backend directory...

cd /d d:\HRMS\hrms-backend

if not exist "node_modules" (
    echo ERROR: node_modules not found!
    echo Please run: npm install
    echo.
    pause
    exit
)

echo.
echo Starting NestJS server on port 3000...
echo.
echo ========================================
echo.

npm run start:dev

echo.
echo Backend server stopped.
pause
