# 🚀 Guía de Configuración Rápida

Esta guía te permitirá configurar y ejecutar el Sistema Educativo Web en cualquier laptop en pocos minutos.

## 📋 Prerequisitos

Antes de comenzar, asegúrate de tener instalados:

- **Python 3.10+** ([Descargar](https://python.org/downloads/))
- **Node.js 20+** ([Descargar](https://nodejs.org/))
- **Git** (opcional, para clonar el repositorio)

## ⚡ Configuración Automática (Recomendado)

### Para Linux/Mac:
```bash
# 1. Clona el repositorio
git clone <URL-del-repo>
cd Proyecto_Web

# 2. Ejecuta el script de configuración
./setup.sh
```

### Para Windows:
```cmd
REM 1. Clona el repositorio
git clone <URL-del-repo>
cd Proyecto_Web

REM 2. Ejecuta el script de configuración
setup.bat
```

## 🔧 Configuración Manual

Si prefieres configurar paso a paso o el script automático presenta problemas:

### 1. Backend (Django)

```bash
cd sistema_educativo

# Crear entorno virtual
python -m venv venv

# Activar entorno virtual
# En Linux/Mac:
source venv/bin/activate
# En Windows:
venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno
cp .env.example .env
# Edita .env con tus configuraciones

# Configurar base de datos
python manage.py migrate

# Crear superusuario (opcional)
python manage.py createsuperuser

# Ejecutar servidor
python manage.py runserver
```

### 2. Frontend (Next.js)

```bash
cd frontend

# Configurar variables de entorno
cp .env.local.example .env.local

# Instalar dependencias
npm install
# O si tienes Bun: bun install

# Ejecutar servidor de desarrollo
npm run dev
# O si tienes Bun: bun run dev
```

## 🔐 Variables de Entorno Importantes

### Backend (.env)
```env
SECRET_KEY=tu_clave_secreta_aqui
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000
ANTHROPIC_API_KEY=tu_api_key_aqui  # Opcional, para recomendaciones IA
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 🌐 Acceso a la Aplicación

Una vez configurado:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Panel Admin**: http://localhost:8000/admin

## 🚨 Solución de Problemas Comunes

### Error: "No module named 'cv2'"
El proyecto incluye funciones opcionales de monitoreo de atención que requieren OpenCV. Estas funciones son opcionales:

```bash
# Para habilitar funciones de monitoreo de atención:
pip install -r requirements-cv.txt

# O instalar manualmente:
pip install opencv-python mediapipe numpy
```

Si no necesitas estas funciones, el proyecto funcionará sin ellas.

### Error de puerto ocupado
Si los puertos 3000 u 8000 están ocupados:
```bash
# Backend en puerto diferente
python manage.py runserver 8001

# Frontend en puerto diferente  
npm run dev -- -p 3001
```

### Problemas con dependencias
```bash
# Backend: actualizar pip y reinstalar
pip install --upgrade pip
pip install -r requirements.txt --force-reinstall

# Frontend: limpiar cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

## 📱 Características Principales

- **👤 Gestión de Usuarios**: Registro, login, perfiles
- **📚 Cursos**: Estructura jerárquica (Curso > Nivel > Fase > Recursos)
- **👁️ Monitoreo de Atención**: Análisis facial en tiempo real
- **🤖 Recomendaciones IA**: Sugerencias personalizadas con Anthropic
- **📊 Panel de Control**: Métricas y estadísticas
- **🔐 Autenticación JWT**: Segura y escalable

## 📚 Recursos Adicionales

- [Documentación completa](README.md)
- [Endpoints API](README.md#endpoints)
- [Arquitectura del sistema](README.md#arquitectura)

## 🆘 ¿Necesitas Ayuda?

Si encuentras problemas:

1. Verifica que tienes las versiones correctas de Python y Node.js
2. Asegúrate de estar en el directorio correcto
3. Revisa que las variables de entorno estén configuradas
4. Consulta la documentación completa en README.md

---

*¡Ahora estás listo para usar el Sistema Educativo Web! 🎉*