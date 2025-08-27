#!/bin/bash

# Setup script for Sistema Educativo Web
# This script automates the initial setup process

set -e  # Exit on any error

echo "🚀 Setting up Sistema Educativo Web..."
echo "======================================"

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.10+ and try again."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 20+ and try again."
    exit 1
fi

echo "✅ Python and Node.js are installed"

# Backend setup
echo ""
echo "🔧 Setting up Django Backend..."
echo "------------------------------"

cd sistema_educativo

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
echo "Upgrading pip..."
pip install --upgrade pip

# Install requirements
echo "Installing Python dependencies..."
pip install -r requirements.txt

# Copy environment file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating .env file from example..."
    cp .env.example .env
    echo "⚠️  Please edit sistema_educativo/.env file with your configuration"
fi

# Run migrations
echo "Running database migrations..."
python manage.py migrate

# Create media directory
mkdir -p media

echo "✅ Backend setup complete!"

# Frontend setup
echo ""
echo "🎨 Setting up Next.js Frontend..."
echo "-------------------------------"

cd ../frontend

# Copy environment file if it doesn't exist
if [ ! -f ".env.local" ]; then
    echo "Creating .env.local file from example..."
    cp .env.local.example .env.local
fi

# Check if bun is installed, otherwise use npm
if command -v bun &> /dev/null; then
    echo "Installing dependencies with Bun..."
    bun install
else
    echo "Bun not found, installing dependencies with npm..."
    npm install
fi

echo "✅ Frontend setup complete!"

# Final instructions
echo ""
echo "🎉 Setup Complete!"
echo "=================="
echo ""
echo "To start the application:"
echo ""
echo "1. Start the backend (in sistema_educativo directory):"
echo "   source venv/bin/activate"
echo "   python manage.py runserver"
echo ""
echo "2. Start the frontend (in frontend directory):"
if command -v bun &> /dev/null; then
    echo "   bun run dev"
else
    echo "   npm run dev"
fi
echo ""
echo "3. Create a superuser (optional):"
echo "   cd sistema_educativo"
echo "   source venv/bin/activate"
echo "   python manage.py createsuperuser"
echo ""
echo "🌐 Access the application:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:8000"
echo "   Admin Panel: http://localhost:8000/admin"
echo ""
echo "📝 Don't forget to:"
echo "   - Edit sistema_educativo/.env with your settings"
echo "   - Add your ANTHROPIC_API_KEY if you want AI recommendations"
echo ""