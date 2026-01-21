@echo off
echo Creating hierarchy feature directories and files...

mkdir "hrms-frontend\app\employees\hierarchy" 2>nul

echo.
echo ✓ Directories created successfully!
echo.
echo Next steps:
echo 1. Copy the hierarchy page component to: hrms-frontend\app\employees\hierarchy\page.tsx
echo 2. Run the database migration in hrms-backend directory
echo 3. Restart the application
echo.
pause
