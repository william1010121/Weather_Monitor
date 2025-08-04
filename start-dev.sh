#!/bin/bash

# Weather Observation Logger - Development Startup Script
# This script starts both backend and frontend in development mode

set -e

echo "🌤️  Weather Observation Logger - Development Setup"
echo "=================================================="

# Check if required tools are installed
check_command() {
    if ! command -v $1 &> /dev/null; then
        echo "❌ $1 is not installed. Please install it first."
        echo "   Backend requires: uv, python3.11+"
        echo "   Frontend requires: node, npm"
        exit 1
    fi
}

echo "🔍 Checking required tools..."
check_command "uv"
check_command "node"
check_command "npm"
check_command "docker"

# Check if environment files exist
if [ ! -f ".env" ]; then
    echo "⚠️  Root .env file not found. Creating from template..."
    cp .env.example .env
    echo "   Please edit .env with your Google OAuth credentials"
fi

if [ ! -f "backend/.env" ]; then
    echo "⚠️  Backend .env file not found. Creating from template..."
    cp backend/.env.example backend/.env
    echo "   Please edit backend/.env with your configuration"
fi

if [ ! -f "frontend/.env" ]; then
    echo "⚠️  Frontend .env file not found. Creating from template..."
    cp frontend/.env.example frontend/.env
    echo "   Please edit frontend/.env with your configuration"
fi

# Check if PostgreSQL is running
echo "🐘 Checking PostgreSQL..."
if ! docker ps | grep -q "weather-postgres"; then
    echo "🚀 Starting PostgreSQL container..."
    docker run --name weather-postgres \
        -e POSTGRES_DB=weather_db \
        -e POSTGRES_USER=weather_user \
        -e POSTGRES_PASSWORD=weather_password \
        -p 5432:5432 \
        -d postgres:15
    
    echo "⏳ Waiting for PostgreSQL to be ready..."
    sleep 10
else
    echo "✅ PostgreSQL container is already running"
fi

# Setup backend
echo "🔧 Setting up backend..."
cd backend

if [ ! -d ".venv" ]; then
    echo "   Installing backend dependencies..."
    uv sync
fi

echo "   Running database migrations..."
uv run alembic upgrade head

echo "🚀 Starting backend server..."
uv run uvicorn main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# Setup frontend
echo "🔧 Setting up frontend..."
cd ../frontend

if [ ! -d "node_modules" ]; then
    echo "   Installing frontend dependencies..."
    npm install
fi

echo "🚀 Starting frontend server..."
npm start &
FRONTEND_PID=$!

# Wait and show status
sleep 5
echo ""
echo "🎉 Development servers are starting up!"
echo "=================================================="
echo "📱 Frontend: http://localhost:3000"
echo "🔌 Backend API: http://localhost:8000"  
echo "📚 API Docs: http://localhost:8000/docs"
echo "🐘 PostgreSQL: localhost:5432"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Cleanup function
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    echo "✅ Servers stopped"
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup INT TERM

# Wait for processes
wait $BACKEND_PID $FRONTEND_PID