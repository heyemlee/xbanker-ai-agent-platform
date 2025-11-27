#!/bin/bash

# xBanker MVP - Quick Start Script

echo "🚀 Starting xBanker AI Agent Suite MVP..."
echo ""

# Check if we're in the right directory
if [ ! -f "README.md" ]; then
    echo "❌ Error: Please run this script from the xbanker.ai root directory"
    exit 1
fi

# Backend Setup
echo "📦 Setting up backend..."
cd backend

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment and install dependencies
echo "Installing Python dependencies..."
source venv/bin/activate
pip install -q -r requirements.txt

# Copy env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Note: Running in MOCK mode (no OpenAI API key). Edit backend/.env to add your API key."
fi

# Start backend server
echo "🔧 Starting backend server on http://localhost:8000..."
uvicorn app.main:app --reload &
BACKEND_PID=$!

cd ..

# Frontend Setup
echo ""
echo "🎨 Setting up frontend..."
cd frontend

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "Installing Node dependencies..."
    npm install
fi

# Copy env file if it doesn't exist
if [ ! -f ".env.local" ]; then
    echo "Creating .env.local file from template..."
    cp .env.local.example .env.local
fi

# Wait a moment for backend to start
echo "Waiting for backend to initialize..."
sleep 3

# Start frontend server
echo "🎨 Starting frontend on http://localhost:3000..."
npm run dev &
FRONTEND_PID=$!

cd ..

echo ""
echo "✅ xBanker MVP is running!"
echo ""
echo "📍 Backend API: http://localhost:8000"
echo "📍 API Docs: http://localhost:8000/docs"
echo "📍 Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Wait for either process to finish
wait $BACKEND_PID $FRONTEND_PID
