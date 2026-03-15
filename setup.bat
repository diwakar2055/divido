@echo off
REM Divido Full Stack Setup Script for Windows
REM This script sets up both backend and frontend for local development

echo.
echo 🚀 Divido - Expense Sharing Application Setup
echo =============================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed. Please install Node.js v16 or higher.
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✅ Node.js version: %NODE_VERSION%
echo.

REM Setup Backend
echo 📦 Setting up Backend Server...
cd server

if not exist ".env" (
    echo Creating .env file from template...
    copy .env.example .env
    echo ⚠️  Please edit server\.env with your MongoDB Atlas connection string and JWT secret
)

echo Installing backend dependencies...
call npm install

echo.
echo ✅ Backend setup complete!
echo To start the backend, run: cd server && npm run dev
echo.

REM Setup Frontend
echo 📦 Setting up Frontend React App...
cd ..\web

if not exist ".env" (
    echo Creating .env file from template...
    copy .env.example .env
    echo ✅ Frontend .env created with default settings
)

echo Installing frontend dependencies...
call npm install

echo.
echo ✅ Frontend setup complete!
echo To start the frontend, run: cd web && npm run dev
echo.

echo =============================================
echo ✅ Setup Complete!
echo.
echo Next steps:
echo 1. Update server\.env with your MongoDB Atlas connection string
echo 2. In one terminal: cd server && npm run dev
echo 3. In another terminal: cd web && npm run dev
echo 4. Open http://localhost:3000 in your browser
echo.
echo 📚 For detailed instructions, see README_FULLSTACK.md
echo.
