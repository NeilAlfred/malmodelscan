#!/bin/bash

# MalModelScan Backend Startup Script

echo "Starting MalModelScan Backend..."

# Get script directory and change to backend directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT/backend"

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install dependencies if requirements.txt has changed
if [ -f "requirements.txt" ]; then
    echo "Installing dependencies..."
    pip install -r requirements.txt
fi

# Add project root to Python path to include the tensorflow folder
echo "Setting up Python path..."
export PYTHONPATH="$PROJECT_ROOT:$PROJECT_ROOT/tensorflow:$PYTHONPATH"

# Start the FastAPI server
echo "Starting FastAPI server on http://127.0.0.1:5180"
echo "API Documentation will be available at: http://127.0.0.1:5180/docs"
echo "Press Ctrl+C to stop the server"
echo "Using project's slim tensorflow folder"

uvicorn main:app --host 127.0.0.1 --port 5180 --reload