# HRMS Startup Scripts

This directory contains scripts to easily start the HRMS application services.

## Port Configuration

- **Backend (NestJS)**: Port 3000
- **Frontend (Next.js)**: Port 3001

## Quick Start

### Windows

Double-click `start-all.bat` or run:
```cmd
start-all.bat
```

This will open two separate command windows:
1. Backend server on port 3000
2. Frontend server on port 3001

### Linux/Mac

Make scripts executable first:
```bash
chmod +x start-all.sh hrms-backend/start-backend.sh hrms-frontend/start-frontend.sh
```

Then run:
```bash
./start-all.sh
```

## Individual Services

### Backend Only

**Windows:**
```cmd
cd hrms-backend
start-backend.bat
```

**Linux/Mac:**
```bash
cd hrms-backend
./start-backend.sh
```

### Frontend Only

**Windows:**
```cmd
cd hrms-frontend
start-frontend.bat
```

**Linux/Mac:**
```bash
cd hrms-frontend
./start-frontend.sh
```

## Manual Start (if scripts don't work)

### Backend
```bash
cd hrms-backend
set PORT=3000  # Windows (or export PORT=3000 on Linux/Mac)
npm run start:dev
```

### Frontend
```bash
cd hrms-frontend
set PORT=3001  # Windows (or export PORT=3001 on Linux/Mac)
npm run dev
```

## Accessing the Application

Once both services are running:

- **Frontend Application**: http://localhost:3001
- **Backend API**: http://localhost:3000
- **API Health Check**: http://localhost:3000/health

## Stopping Services

- **Windows**: Close the command windows or press Ctrl+C in each window
- **Linux/Mac**: Press Ctrl+C in the terminal (stops both services)

## Troubleshooting

### Port Already in Use

If you get "EADDRINUSE" error, another process is using the port. Stop it:

**Windows:**
```cmd
netstat -ano | findstr :3000
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

**Linux/Mac:**
```bash
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9
```

### Services Not Starting

1. Ensure Node.js is installed: `node --version`
2. Install dependencies:
   ```bash
   cd hrms-backend && npm install
   cd ../hrms-frontend && npm install
   ```
3. Check for errors in the terminal output
