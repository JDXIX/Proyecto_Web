# 🚀 Guía de Instalación Completa - Sistema Educativo Web

Esta guía te ayudará a configurar el proyecto en cualquier laptop de manera rápida y sencilla.

## 📋 Prerrequisitos

Antes de comenzar, asegúrate de tener instalado:

- **Python 3.10 o superior** - [Descargar aquí](https://www.python.org/downloads/)
- **Node.js 20 o superior** - [Descargar aquí](https://nodejs.org/)
- **Git** (opcional pero recomendado) - [Descargar aquí](https://git-scm.com/)
- **Bun** (opcional, más rápido que npm) - [Instalar aquí](https://bun.sh/)

### Verificar instalaciones

```bash
python --version    # Debe mostrar 3.10+
node --version      # Debe mostrar 20+
npm --version       # Viene con Node.js
```

## 🎯 Instalación Rápida (Automática)

### En Linux/Mac:
```bash
# Clonar el repositorio
git clone <URL-del-repositorio>
cd Proyecto_Web

# Ejecutar script de instalación
chmod +x setup.sh
./setup.sh
```

### En Windows:
```cmd
# Clonar el repositorio
git clone <URL-del-repositorio>
cd Proyecto_Web

# Ejecutar script de instalación
setup.bat
```

## 🔧 Instalación Manual (Paso a Paso)

Si prefieres hacer la instalación paso a paso:

### 1. Backend (Django)

```bash
# Navegar al directorio del backend
cd sistema_educativo

# Crear entorno virtual
python -m venv venv

# Activar entorno virtual
# En Linux/Mac:
source venv/bin/activate
# En Windows:
venv\Scripts\activate

# Actualizar pip
pip install --upgrade pip

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno
cp .env.example .env
# Edita el archivo .env con tus configuraciones

# Ejecutar migraciones
python manage.py migrate

# Crear superusuario (opcional)
python manage.py createsuperuser

# Crear directorio para archivos multimedia
mkdir -p media
```

### 2. Frontend (Next.js)

```bash
# Navegar al directorio del frontend
cd ../frontend

# Configurar variables de entorno
cp .env.local.example .env.local

# Instalar dependencias
# Con Bun (recomendado):
bun install
# O con npm:
npm install
```

## 🚀 Ejecutar el Proyecto

### Iniciar Backend (Django)
```bash
cd sistema_educativo
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate   # Windows
python manage.py runserver
```
El backend estará disponible en: http://localhost:8000

### Iniciar Frontend (Next.js)
En otra terminal:
```bash
cd frontend
bun run dev    # o npm run dev
```
El frontend estará disponible en: http://localhost:3000

## ⚙️ Configuración

### Variables de Entorno del Backend (.env)

Edita `sistema_educativo/.env`:

```env
# Configuraciones básicas
SECRET_KEY=tu_clave_secreta_aqui
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# CORS para el frontend
CORS_ALLOWED_ORIGINS=http://localhost:3000

# API de Anthropic (opcional, para recomendaciones IA)
ANTHROPIC_API_KEY=tu_api_key_aqui

# Base de datos (SQLite por defecto, PostgreSQL para producción)
# DATABASE_URL=postgres://user:pass@localhost:5432/database

# Configuraciones de archivos
MAX_UPLOAD_SIZE=104857600

# Umbrales de atención
UMBRALES_ATENCION_ALTO=80
UMBRALES_ATENCION_MEDIO=50
UMBRALES_ATENCION_BAJO=0
```

### Variables de Entorno del Frontend (.env.local)

Edita `frontend/.env.local`:

```env
# URL del backend
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 🔑 Acceso

1. **Acceso principal**: http://localhost:3000
2. **API del backend**: http://localhost:8000
3. **Panel de administración**: http://localhost:8000/admin

## 🎥 Funcionalidades

### Monitoreo de Atención
- Utiliza la cámara web para detectar nivel de atención
- Requiere permisos de cámara en el navegador
- Funciona con OpenCV y MediaPipe

### Recomendaciones IA
- Requiere configurar ANTHROPIC_API_KEY
- Genera sugerencias personalizadas basadas en el rendimiento
- Se puede deshabilitar dejando vacía la variable

## 🛠️ Dependencias Incluidas

### Backend (Python)
- Django 5.2.4
- Django REST Framework
- OpenCV + MediaPipe (visión por computadora)
- JWT Authentication
- CORS Headers
- Swagger/OpenAPI Documentation

### Frontend (Node.js)
- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Axios (cliente HTTP)
- Chart.js (gráficos)
- Material-UI componentes

## 🐞 Solución de Problemas

### Error: "Python no encontrado"
- Instala Python 3.10+ desde python.org
- En Windows, marca "Add to PATH" durante la instalación

### Error: "Node.js no encontrado"
- Instala Node.js 20+ desde nodejs.org

### Error: "La cámara no funciona"
- Concede permisos de cámara al navegador
- Cierra otras aplicaciones que usen la cámara

### Error: "CORS" en el frontend
- Verifica que CORS_ALLOWED_ORIGINS incluya http://localhost:3000
- Reinicia el servidor backend después de cambiar .env

### Error: "404" en las APIs
- Asegúrate de que el backend esté ejecutándose en puerto 8000
- Verifica NEXT_PUBLIC_API_URL en el frontend

### Error: "Migraciones"
```bash
cd sistema_educativo
source venv/bin/activate
python manage.py makemigrations
python manage.py migrate
```

## 📚 Recursos Adicionales

- [Documentación de Django](https://docs.djangoproject.com/)
- [Documentación de Next.js](https://nextjs.org/docs)
- [API de Anthropic](https://docs.anthropic.com/)

## 🤝 Soporte

Si encuentras problemas durante la instalación:

1. Verifica que tengas las versiones correctas de Python y Node.js
2. Asegúrate de que todas las dependencias se instalaron correctamente
3. Revisa los archivos .env para configuraciones incorrectas
4. Consulta la sección de "Solución de Problemas" arriba

¡Listo! Ya tienes el Sistema Educativo Web funcionando en tu laptop. 🎉