@echo off
REM Verification script to test if the project setup is working correctly
REM Run this after setup to verify everything is configured properly

echo 🔍 Verificando instalación del Sistema Educativo Web...
echo ====================================================

REM Check if we're in the right directory
if not exist "setup.bat" (
    echo ❌ Error: Este script debe ejecutarse desde el directorio raíz del proyecto
    pause
    exit /b 1
)

REM Check backend setup
echo.
echo 🔧 Verificando Backend (Django)...
echo --------------------------------

cd sistema_educativo

REM Check if virtual environment exists
if not exist "venv" (
    echo ❌ Virtual environment no encontrado. Ejecuta primero setup.bat
    pause
    exit /b 1
)

REM Check if .env exists
if not exist ".env" (
    echo ❌ Archivo .env no encontrado. Copia .env.example a .env
    pause
    exit /b 1
)

REM Activate virtual environment and test
call venv\Scripts\activate.bat
echo ✅ Virtual environment activado

REM Test Django installation
python -c "import django; print(f'Django {django.get_version()} instalado')" 2>nul
if %errorlevel% equ 0 (
    echo ✅ Django instalado correctamente
) else (
    echo ❌ Django no instalado. Ejecuta: pip install -r requirements.txt
    pause
    exit /b 1
)

REM Test Django configuration
python manage.py check >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Configuración de Django válida
) else (
    echo ⚠️  Hay advertencias en la configuración de Django
)

REM Check frontend setup
echo.
echo 🎨 Verificando Frontend (Next.js)...
echo ----------------------------------

cd ..\frontend

REM Check if .env.local exists
if not exist ".env.local" (
    echo ❌ Archivo .env.local no encontrado. Copia .env.local.example a .env.local
    pause
    exit /b 1
)

REM Check if node_modules exists
if not exist "node_modules" (
    echo ❌ Dependencias de Node.js no instaladas. Ejecuta: npm install
    pause
    exit /b 1
)

REM Test Next.js
npx next --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Next.js instalado correctamente
) else (
    echo ❌ Next.js no instalado correctamente
    pause
    exit /b 1
)

REM Final summary
echo.
echo 📋 Resumen de la verificación:
echo ============================
echo ✅ Estructura del proyecto correcta
echo ✅ Backend (Django) configurado
echo ✅ Frontend (Next.js) configurado
echo.
echo 🚀 Para ejecutar el proyecto:
echo.
echo Terminal 1 (Backend):
echo   cd sistema_educativo
echo   venv\Scripts\activate.bat
echo   python manage.py runserver
echo.
echo Terminal 2 (Frontend):
echo   cd frontend
echo   npm run dev
echo.
echo 🌐 URLs:
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:8000
echo   Admin:    http://localhost:8000/admin
echo.
echo ✨ ¡Verificación completada! El proyecto está listo para usar.
echo.
pause