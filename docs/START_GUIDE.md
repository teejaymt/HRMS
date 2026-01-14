# Quick Start Guide

## Starting the HRMS System

### Option 1: Start Both Servers (Recommended)

**Terminal 1 - Backend Server:**
```bash
cd d:\HRMS\hrms-backend
npm run start:dev
```
Backend will start on: http://localhost:3000

**Terminal 2 - Frontend Server:**
```bash
cd d:\HRMS\hrms-frontend
npm run dev
```
Frontend will start on: http://localhost:3001 (or 3002 if 3001 is taken)

---

### Option 2: Quick Start Script

**Create a start script** (Windows):

1. Create `start-hrms.bat` in `d:\HRMS\`:
```batch
@echo off
echo Starting HRMS Backend...
start cmd /k "cd hrms-backend && npm run start:dev"

timeout /t 5

echo Starting HRMS Frontend...
start cmd /k "cd hrms-frontend && npm run dev"

echo.
echo HRMS System Starting...
echo Backend: http://localhost:3000
echo Frontend: http://localhost:3001 or 3002
echo.
pause
```

2. Double-click `start-hrms.bat` to start both servers

---

## Accessing the System

1. **Frontend**: http://localhost:3001 (or check terminal for actual port)
2. **Backend API**: http://localhost:3000
3. **Login**: Use your admin credentials

---

## Troubleshooting

### Port Already in Use
If you see "Port already in use":
```bash
# Kill process on port 3000 (backend)
npx kill-port 3000

# Kill process on port 3001 (frontend)
npx kill-port 3001
```

### Backend Won't Start
1. Check if database exists: `d:\HRMS\hrms-backend\dev.db`
2. Run migrations: `cd hrms-backend && npx prisma migrate dev`
3. Generate Prisma client: `npx prisma generate`

### Frontend Won't Start
1. Clear Next.js cache: `cd hrms-frontend && rm -rf .next`
2. Reinstall dependencies: `npm install`

---

## Default Login Credentials

Check `d:\HRMS\EMPLOYEE_CREDENTIALS.md` for login details.

---

**Last Updated**: January 2026
