#!/bin/bash
# HRMS Full Application Startup Script
# Starts both Backend and Frontend servers

echo "========================================"
echo "  HRMS Application Startup"
echo "========================================"
echo ""
echo "This will start:"
echo "  - Backend (NestJS) on port 3000"
echo "  - Frontend (Next.js) on port 3001"
echo ""
echo "========================================"
echo ""

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Start Backend
echo "Starting Backend..."
cd "$SCRIPT_DIR/hrms-backend"
export PORT=3000
npm run start:dev &
BACKEND_PID=$!

# Wait for backend to initialize
sleep 3

# Start Frontend
echo "Starting Frontend..."
cd "$SCRIPT_DIR/hrms-frontend"
export PORT=3001
npm run dev &
FRONTEND_PID=$!

echo ""
echo "========================================"
echo "  Services Started"
echo "========================================"
echo ""
echo "Backend:  http://localhost:3000 (PID: $BACKEND_PID)"
echo "Frontend: http://localhost:3001 (PID: $FRONTEND_PID)"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Wait for processes
wait
