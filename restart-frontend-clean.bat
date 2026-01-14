@echo off
title Clear Next.js Cache and Restart Frontend
color 0E

echo ========================================
echo    Clearing Next.js Cache
echo ========================================
echo.

cd /d d:\HRMS\hrms-frontend

echo Stopping any running processes on port 3001...
npx kill-port 3001

echo.
echo Deleting .next cache folder...
if exist .next (
    rmdir /s /q .next
    echo ✓ .next folder deleted
) else (
    echo .next folder not found
)

echo.
echo Deleting node_modules cache...
if exist node_modules\.cache (
    rmdir /s /q node_modules\.cache
    echo ✓ node_modules\.cache deleted
) else (
    echo node_modules\.cache not found
)

echo.
echo ========================================
echo    Starting Fresh Frontend Server
echo ========================================
echo.

npm run dev

pause
