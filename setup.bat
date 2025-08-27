@echo off
REM Setup script for Sistema Educativo Web (Windows)
REM This script automates the initial setup process

echo 🚀 Setting up Sistema Educativo Web...
echo ======================================

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python is not installed. Please install Python 3.10+ and try again.
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 20+ and try again.
    pause
    exit /b 1
)

echo ✅ Python and Node.js are installed

REM Backend setup
echo.
echo 🔧 Setting up Django Backend...
echo ------------------------------

cd sistema_educativo

REM Create virtual environment if it doesn't exist
if not exist "venv" (
    echo Creating Python virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Upgrade pip
echo Upgrading pip...
python -m pip install --upgrade pip

REM Install requirements
echo Installing Python dependencies...
pip install -r requirements.txt

REM Copy environment file if it doesn't exist
if not exist ".env" (
    echo Creating .env file from example...
    copy .env.example .env
    echo ⚠️  Please edit sistema_educativo\.env file with your configuration
)

REM Run migrations
echo Running database migrations...
python manage.py migrate

REM Create media directory
if not exist "media" mkdir media

echo ✅ Backend setup complete!

REM Frontend setup
echo.
echo 🎨 Setting up Next.js Frontend...
echo -------------------------------

cd ..\frontend

REM Copy environment file if it doesn't exist
if not exist ".env.local" (
    echo Creating .env.local file from example...
    copy .env.local.example .env.local
)

REM Check if bun is installed, otherwise use npm
bun --version >nul 2>&1
if %errorlevel% equ 0 (
    echo Installing dependencies with Bun...
    bun install
) else (
    echo Bun not found, installing dependencies with npm...
    npm install
)

echo ✅ Frontend setup complete!

REM Final instructions
echo.
echo 🎉 Setup Complete!
echo ==================
echo.
echo To start the application:
echo.
echo 1. Start the backend (in sistema_educativo directory):
echo    venv\Scripts\activate.bat
echo    python manage.py runserver
echo.
echo 2. Start the frontend (in frontend directory):
bun --version >nul 2>&1
if %errorlevel% equ 0 (
    echo    bun run dev
) else (
    echo    npm run dev
)
echo.
echo 3. Create a superuser (optional):
echo    cd sistema_educativo
echo    venv\Scripts\activate.bat
echo    python manage.py createsuperuser
echo.
echo 🌐 Access the application:
echo    Frontend: http://localhost:3000
echo    Backend API: http://localhost:8000
echo    Admin Panel: http://localhost:8000/admin
echo.
echo 📝 Don't forget to:
echo    - Edit sistema_educativo\.env with your settings
echo    - Add your ANTHROPIC_API_KEY if you want AI recommendations
echo.
pause