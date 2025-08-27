@echo off
setlocal enabledelayedexpansion

REM Script de configuración del Sistema Educativo Web para Windows
REM Este script automatiza la configuración completa del proyecto

echo 🚀 Configurando Sistema Educativo Web...
echo ==========================================

REM Verificar si estamos en el directorio correcto
if not exist "README.md" (
    echo ❌ Error: Ejecuta este script desde el directorio raíz del proyecto ^(donde está README.md^)
    pause
    exit /b 1
)

REM Verificar dependencias del sistema
echo 📋 Verificando dependencias del sistema...

REM Verificar Python
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python no está instalado. Instálalo desde https://python.org
    pause
    exit /b 1
)

REM Verificar Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js no está instalado. Instálalo desde https://nodejs.org
    pause
    exit /b 1
)

echo ✅ Dependencias del sistema verificadas

REM Configurar Backend (Django)
echo.
echo 🔧 Configurando Backend ^(Django^)...
cd sistema_educativo

REM Crear entorno virtual si no existe
if not exist "venv" (
    echo 📦 Creando entorno virtual de Python...
    python -m venv venv
)

REM Activar entorno virtual
echo 🔄 Activando entorno virtual...
call venv\Scripts\activate

REM Instalar dependencias
echo 📥 Instalando dependencias de Python...
python -m pip install --upgrade pip
pip install -r requirements.txt

REM Crear archivo .env si no existe
if not exist ".env" (
    echo 📝 Creando archivo de configuración .env...
    copy .env.example .env
    echo.
    echo ⚠️  IMPORTANTE: Edita el archivo sistema_educativo\.env con tus configuraciones:
    echo    - SECRET_KEY: Cambia por una clave secreta única
    echo    - ANTHROPIC_API_KEY: Tu clave de API de Anthropic ^(opcional^)
    echo.
)

REM Ejecutar migraciones
echo 🗄️  Configurando base de datos...
python manage.py migrate

REM Preguntar si crear superusuario
echo.
set /p create_superuser="¿Deseas crear un superusuario para el panel de administración? (y/n): "
if /i "!create_superuser!"=="y" (
    python manage.py createsuperuser
)

echo ✅ Backend configurado correctamente

REM Volver al directorio raíz
cd ..

REM Configurar Frontend (Next.js)
echo.
echo 🎨 Configurando Frontend ^(Next.js^)...
cd frontend

REM Crear archivo .env.local si no existe
if not exist ".env.local" (
    echo 📝 Creando archivo de configuración .env.local...
    copy .env.local.example .env.local
)

REM Instalar dependencias
echo 📥 Instalando dependencias de Node.js...
REM Verificar si Bun está disponible
bun --version >nul 2>&1
if errorlevel 1 (
    echo 📦 Usando npm para instalación...
    npm install
) else (
    echo 🚀 Usando Bun para instalación rápida...
    bun install
)

echo ✅ Frontend configurado correctamente

REM Volver al directorio raíz
cd ..

REM Mensaje final
echo.
echo 🎉 ¡Configuración completada!
echo ==========================
echo.
echo 📚 Para ejecutar el proyecto:
echo.
echo 🔧 Backend ^(Django^):
echo    cd sistema_educativo
echo    venv\Scripts\activate
echo    python manage.py runserver
echo    ➡️  Disponible en: http://localhost:8000
echo.
echo 🎨 Frontend ^(Next.js^):
echo    cd frontend
bun --version >nul 2>&1
if errorlevel 1 (
    echo    npm run dev
) else (
    echo    bun run dev
)
echo    ➡️  Disponible en: http://localhost:3000
echo.
echo 📖 Documentación completa en README.md
echo.
echo ⚠️  Recuerda:
echo    - Configurar las variables de entorno en .env y .env.local
echo    - El backend debe estar ejecutándose antes que el frontend
echo    - Para funciones de IA, configura ANTHROPIC_API_KEY

pause