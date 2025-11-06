#!/bin/bash

echo "🧪 Testing MalModelScan Setup"
echo "=============================="

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Test Python dependencies
echo ""
echo "📦 Testing Python dependencies..."
cd "$PROJECT_ROOT/backend"

if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

source venv/bin/activate

echo "Installing backend dependencies..."
pip install fastapi uvicorn python-multipart aiofiles pydantic

# Test basic FastAPI import
echo ""
echo "🔧 Testing FastAPI import..."
python -c "
import fastapi
import uvicorn
print('✅ FastAPI and Uvicorn imported successfully')
"

# Test basic FastAPI app creation
echo ""
echo "🚀 Testing FastAPI app creation..."
python -c "
import sys
import os
from fastapi import FastAPI

app = FastAPI(title='Test App')

@app.get('/')
async def root():
    return {'message': 'Test successful'}

print('✅ FastAPI app created successfully')
"

# Test file structure
echo ""
echo "📁 Testing file structure..."
if [ -f "main.py" ]; then
    echo "✅ Backend main.py exists"
else
    echo "❌ Backend main.py missing"
fi

cd "$PROJECT_ROOT/frontend"

if [ -f "package.json" ]; then
    echo "✅ Frontend package.json exists"
else
    echo "❌ Frontend package.json missing"
fi

if [ -d "src" ]; then
    echo "✅ Frontend src directory exists"
else
    echo "❌ Frontend src directory missing"
fi

cd "$PROJECT_ROOT"

echo ""
echo "📋 Setup test completed!"
echo "To start the full application, run: ./scripts/start-local.sh"