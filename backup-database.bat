@echo off
REM Database Backup Script for HRMS
REM Creates a timestamped backup of the SQLite database

setlocal enabledelayedexpansion

REM Get current date and time for backup filename
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
set BACKUP_DATE=%datetime:~0,8%_%datetime:~8,6%

REM Create backups directory if it doesn't exist
if not exist "hrms-backend\prisma\backups" mkdir "hrms-backend\prisma\backups"

REM Copy database file
copy "hrms-backend\prisma\dev.db" "hrms-backend\prisma\backups\dev_backup_%BACKUP_DATE%.db"

echo.
echo ========================================
echo   Database Backup Created
echo ========================================
echo.
echo Backup file: dev_backup_%BACKUP_DATE%.db
echo Location: hrms-backend\prisma\backups\
echo.
pause
