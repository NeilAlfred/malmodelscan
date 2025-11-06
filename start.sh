#!/bin/bash

# MalModelScan Quick Start Script
# This script makes it easy to start the application from the project root

echo "🚀 MalModelScan Quick Start"
echo "=========================="

# Check if script is run from project root
if [ ! -f "main.py" ] && [ ! -d "frontend" ] && [ ! -d "backend" ]; then
    echo "❌ Error: Please run this script from the MalModelScan project root directory"
    exit 1
fi

# Start the main application using the scripts directory
if [ -f "scripts/start-local.sh" ]; then
    echo "Starting MalModelScan local development environment..."
    exec ./scripts/start-local.sh
else
    echo "❌ Error: scripts/start-local.sh not found"
    exit 1
fi