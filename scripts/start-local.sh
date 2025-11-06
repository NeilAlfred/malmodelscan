#!/bin/bash

# MalModelScan Local Development Startup Script

echo "🚀 Starting MalModelScan Local Development Environment..."
echo "======================================================"

# Function to check if a port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        return 0
    else
        return 1
    fi
}

# Get script directory and project root
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Function to start backend
start_backend() {
    echo ""
    echo "🔧 Starting Backend Service..."
    cd "$PROJECT_ROOT/backend"

    # Check if virtual environment exists
    if [ ! -d "venv" ]; then
        echo "Creating backend virtual environment..."
        python3 -m venv venv
    fi

    # Activate virtual environment
    source venv/bin/activate

    # Install dependencies
    echo "Installing backend dependencies..."
    pip install -r requirements.txt

    # Set up Python path to include slim tensorflow
    export PYTHONPATH="$PROJECT_ROOT:$PROJECT_ROOT/tensorflow:$PYTHONPATH"

    # Start backend in background
    echo "Starting FastAPI server on http://127.0.0.1:5180"
    echo "Using project's slim tensorflow folder"
    python main.py &
    BACKEND_PID=$!
    cd ..

    # Wait a moment for backend to start
    sleep 3

    # Check if backend started successfully
    if check_port 5180; then
        echo "✅ Backend started successfully (PID: $BACKEND_PID)"
        echo "📚 API Documentation: http://127.0.0.1:5180/docs"
    else
        echo "❌ Backend failed to start"
        kill $BACKEND_PID 2>/dev/null
        exit 1
    fi
}

# Function to start frontend
start_frontend() {
    echo ""
    echo "🎨 Starting Frontend Development Server..."
    cd "$PROJECT_ROOT/frontend"

    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        echo "Installing frontend dependencies..."
        npm install
    fi

    # Start frontend in background
    echo "Starting Vue dev server on http://localhost:5173"
    npm run dev &
    FRONTEND_PID=$!
    cd ..

    # Wait a moment for frontend to start
    sleep 3

    # Check if frontend started successfully
    if check_port 5173; then
        echo "✅ Frontend started successfully (PID: $FRONTEND_PID)"
        echo "🌐 Frontend URL: http://localhost:5173"
    else
        echo "❌ Frontend failed to start"
        kill $BACKEND_PID 2>/dev/null
        kill $FRONTEND_PID 2>/dev/null
        exit 1
    fi
}

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down services..."

    if [ ! -z "$BACKEND_PID" ]; then
        echo "Stopping backend (PID: $BACKEND_PID)..."
        kill $BACKEND_PID 2>/dev/null
    fi

    if [ ! -z "$FRONTEND_PID" ]; then
        echo "Stopping frontend (PID: $FRONTEND_PID)..."
        kill $FRONTEND_PID 2>/dev/null
    fi

    echo "✅ All services stopped"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Start services
start_backend
start_frontend

echo ""
echo "🎉 MalModelScan is now running!"
echo "================================"
echo "🌐 Frontend: http://localhost:5173"
echo "🔧 Backend API: http://127.0.0.1:5180"
echo "📚 API Docs: http://127.0.0.1:5180/docs"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Keep script running
wait