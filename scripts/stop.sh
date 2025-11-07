#!/bin/bash

echo "Stopping MalModelScan services..."

# Stop frontend processes
echo "Stopping frontend..."
pkill -f "npm.*run.*dev" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true

# Stop backend processes
echo "Stopping backend..."
pkill -f "uvicorn.*5180" 2>/dev/null || true
pkill -f "python.*main.py" 2>/dev/null || true

# Wait a moment for processes to stop
sleep 2

# Check if any processes are still running
FRONTEND_RUNNING=$(ps aux | grep -E "(npm.*run.*dev|vite)" | grep -v grep | wc -l)
BACKEND_RUNNING=$(ps aux | grep -E "(uvicorn.*5180|python.*main.py)" | grep -v grep | wc -l)

if [ $FRONTEND_RUNNING -eq 0 ] && [ $BACKEND_RUNNING -eq 0 ]; then
    echo "✅ All services stopped successfully"
else
    echo "⚠️  Some services may still be running:"
    if [ $FRONTEND_RUNNING -gt 0 ]; then
        echo "  - Frontend processes: $FRONTEND_RUNNING"
    fi
    if [ $BACKEND_RUNNING -gt 0 ]; then
        echo "  - Backend processes: $BACKEND_RUNNING"
    fi
fi

echo "Done."