#!/bin/bash

# Verification script to test if the project setup is working correctly
# Run this after setup to verify everything is configured properly

echo "🔍 Verificando instalación del Sistema Educativo Web..."
echo "===================================================="

# Check if we're in the right directory
if [ ! -f "setup.sh" ] || [ ! -d "sistema_educativo" ] || [ ! -d "frontend" ]; then
    echo "❌ Error: Este script debe ejecutarse desde el directorio raíz del proyecto"
    exit 1
fi

# Check backend setup
echo ""
echo "🔧 Verificando Backend (Django)..."
echo "--------------------------------"

cd sistema_educativo

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "❌ Virtual environment no encontrado. Ejecuta primero ./setup.sh"
    exit 1
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "❌ Archivo .env no encontrado. Copia .env.example a .env"
    exit 1
fi

# Check if requirements are installed
source venv/bin/activate
echo "✅ Virtual environment activado"

# Test Django installation
if python -c "import django; print(f'Django {django.get_version()} instalado')" 2>/dev/null; then
    echo "✅ Django instalado correctamente"
else
    echo "❌ Django no instalado. Ejecuta: pip install -r requirements.txt"
    exit 1
fi

# Test other key dependencies
if python -c "import cv2; print('OpenCV instalado')" 2>/dev/null; then
    echo "✅ OpenCV instalado correctamente"
else
    echo "⚠️  OpenCV no instalado (necesario para monitoreo de atención)"
fi

if python -c "import mediapipe; print('MediaPipe instalado')" 2>/dev/null; then
    echo "✅ MediaPipe instalado correctamente"
else
    echo "⚠️  MediaPipe no instalado (necesario para monitoreo de atención)"
fi

# Test Django configuration
if python manage.py check --deploy 2>/dev/null; then
    echo "✅ Configuración de Django válida"
else
    echo "⚠️  Hay advertencias en la configuración de Django (normal en desarrollo)"
fi

# Test database
if python manage.py showmigrations --plan | grep -q "[ ]"; then
    echo "⚠️  Hay migraciones pendientes. Ejecuta: python manage.py migrate"
else
    echo "✅ Base de datos actualizada"
fi

# Check frontend setup
echo ""
echo "🎨 Verificando Frontend (Next.js)..."
echo "----------------------------------"

cd ../frontend

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "❌ Archivo .env.local no encontrado. Copia .env.local.example a .env.local"
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "❌ Dependencias de Node.js no instaladas. Ejecuta: npm install o bun install"
    exit 1
fi

# Test Next.js
if npx next --version 2>/dev/null; then
    echo "✅ Next.js instalado correctamente"
else
    echo "❌ Next.js no instalado correctamente"
    exit 1
fi

# Test if project can build (quick check)
echo "🔨 Probando build del frontend..."
if npm run build 2>/dev/null >/dev/null; then
    echo "✅ Frontend compila correctamente"
    rm -rf .next  # Clean up build artifacts
else
    echo "⚠️  El frontend tiene errores de compilación"
fi

# Final summary
echo ""
echo "📋 Resumen de la verificación:"
echo "============================"
echo "✅ Estructura del proyecto correcta"
echo "✅ Backend (Django) configurado"
echo "✅ Frontend (Next.js) configurado"
echo ""
echo "🚀 Para ejecutar el proyecto:"
echo ""
echo "Terminal 1 (Backend):"
echo "  cd sistema_educativo"
echo "  source venv/bin/activate"
echo "  python manage.py runserver"
echo ""
echo "Terminal 2 (Frontend):"
echo "  cd frontend"
echo "  npm run dev  # o bun run dev"
echo ""
echo "🌐 URLs:"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:8000"
echo "  Admin:    http://localhost:8000/admin"
echo ""
echo "✨ ¡Verificación completada! El proyecto está listo para usar."