#!/bin/bash

# Script de configuración del Sistema Educativo Web
# Este script automatiza la configuración completa del proyecto

set -e  # Detener en caso de error

echo "🚀 Configurando Sistema Educativo Web..."
echo "=========================================="

# Verificar si estamos en el directorio correcto
if [ ! -f "README.md" ]; then
    echo "❌ Error: Ejecuta este script desde el directorio raíz del proyecto (donde está README.md)"
    exit 1
fi

# Verificar dependencias del sistema
echo "📋 Verificando dependencias del sistema..."

# Verificar Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 no está instalado. Instálalo desde https://python.org"
    exit 1
fi

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado. Instálalo desde https://nodejs.org"
    exit 1
fi

echo "✅ Dependencias del sistema verificadas"

# Configurar Backend (Django)
echo ""
echo "🔧 Configurando Backend (Django)..."
cd sistema_educativo

# Crear entorno virtual si no existe
if [ ! -d "venv" ]; then
    echo "📦 Creando entorno virtual de Python..."
    python3 -m venv venv
fi

# Activar entorno virtual
echo "🔄 Activando entorno virtual..."
source venv/bin/activate

# Instalar dependencias
echo "📥 Instalando dependencias de Python..."
pip install --upgrade pip
pip install -r requirements.txt

echo "⚠️  Nota: Las funciones de monitoreo de atención requieren dependencias adicionales."
echo "   Para habilitarlas, ejecuta: pip install -r requirements-cv.txt"

# Crear archivo .env si no existe
if [ ! -f ".env" ]; then
    echo "📝 Creando archivo de configuración .env..."
    cp .env.example .env
    echo ""
    echo "⚠️  IMPORTANTE: Edita el archivo sistema_educativo/.env con tus configuraciones:"
    echo "   - SECRET_KEY: Cambia por una clave secreta única"
    echo "   - ANTHROPIC_API_KEY: Tu clave de API de Anthropic (opcional)"
    echo ""
fi

# Ejecutar migraciones
echo "🗄️  Configurando base de datos..."
python manage.py migrate

# Preguntar si crear superusuario
echo ""
read -p "¿Deseas crear un superusuario para el panel de administración? (y/n): " create_superuser
if [[ $create_superuser =~ ^[Yy]$ ]]; then
    python manage.py createsuperuser
fi

echo "✅ Backend configurado correctamente"

# Volver al directorio raíz
cd ..

# Configurar Frontend (Next.js)
echo ""
echo "🎨 Configurando Frontend (Next.js)..."
cd frontend

# Crear archivo .env.local si no existe
if [ ! -f ".env.local" ]; then
    echo "📝 Creando archivo de configuración .env.local..."
    cp .env.local.example .env.local
fi

# Instalar dependencias
echo "📥 Instalando dependencias de Node.js..."
if command -v bun &> /dev/null; then
    echo "🚀 Usando Bun para instalación rápida..."
    bun install
else
    echo "📦 Usando npm para instalación..."
    npm install
fi

echo "✅ Frontend configurado correctamente"

# Volver al directorio raíz
cd ..

# Mensaje final
echo ""
echo "🎉 ¡Configuración completada!"
echo "=========================="
echo ""
echo "📚 Para ejecutar el proyecto:"
echo ""
echo "🔧 Backend (Django):"
echo "   cd sistema_educativo"
echo "   source venv/bin/activate"
echo "   python manage.py runserver"
echo "   ➡️  Disponible en: http://localhost:8000"
echo ""
echo "🎨 Frontend (Next.js):"
echo "   cd frontend"
if command -v bun &> /dev/null; then
    echo "   bun run dev"
else
    echo "   npm run dev"
fi
echo "   ➡️  Disponible en: http://localhost:3000"
echo ""
echo "📖 Documentación completa en README.md"
echo ""
echo "⚠️  Recuerda:"
echo "   - Configurar las variables de entorno en .env y .env.local"
echo "   - El backend debe estar ejecutándose antes que el frontend"
echo "   - Para funciones de IA, configura ANTHROPIC_API_KEY"