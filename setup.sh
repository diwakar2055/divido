#!/bin/bash

# Divido Full Stack Setup Script
# This script sets up both backend and frontend for local development

echo "🚀 Divido - Expense Sharing Application Setup"
echo "=============================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v16 or higher."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo ""

# Setup Backend
echo "📦 Setting up Backend Server..."
cd server

if [ ! -f ".env" ]; then
    echo "Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit server/.env with your MongoDB Atlas connection string and JWT secret"
fi

echo "Installing backend dependencies..."
npm install

echo ""
echo "✅ Backend setup complete!"
echo "To start the backend, run: cd server && npm run dev"
echo ""

# Setup Frontend
echo "📦 Setting up Frontend React App..."
cd ../web

if [ ! -f ".env" ]; then
    echo "Creating .env file from template..."
    cp .env.example .env
    echo "✅ Frontend .env created with default settings"
fi

echo "Installing frontend dependencies..."
npm install

echo ""
echo "✅ Frontend setup complete!"
echo "To start the frontend, run: cd web && npm run dev"
echo ""

echo "=============================================="
echo "✅ Setup Complete!"
echo ""
echo "Next steps:"
echo "1. Update server/.env with your MongoDB Atlas connection string"
echo "2. In one terminal: cd server && npm run dev"
echo "3. In another terminal: cd web && npm run dev"
echo "4. Open http://localhost:3000 in your browser"
echo ""
echo "📚 For detailed instructions, see README_FULLSTACK.md"
