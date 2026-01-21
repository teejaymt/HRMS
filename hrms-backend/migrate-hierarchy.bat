@echo off
cd /d "%~dp0"
call npx prisma migrate dev --name add_employee_hierarchy
pause
