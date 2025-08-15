# Sistema Educativo Web

Sistema integral de gestión educativa con panel de administración, gestión de usuarios, cursos e inscripciones, con módulos de monitoreo de atención y recomendaciones asistidas por IA. Backend en Django REST Framework y frontend en Next.js 15 + Bun + Tailwind CSS.

---

## 🚀 Características principales

- Autenticación con JWT y control de acceso por roles (admin, docente, estudiante).
- Gestión de usuarios: crear, editar (rol/estado/contraseña), eliminar y listar.
- Gestión académica: cursos, fases, lecciones y recursos.
- Inscripción de estudiantes: individual y masiva (CSV).
- Módulo de atención (opcional): monitoreo con cámara (OpenCV + MediaPipe).
- Recomendaciones IA (opcional): sugerencias personalizadas por estudiante/curso.
- UI moderna y responsive con App Router (Next.js) y Tailwind.
- APIs REST modulares por app (usuarios, cursos, atención, recomendaciones).

---

## 🧭 Arquitectura

- Backend: Django REST Framework (DRF), apps:
  - usuarios, cursos, atencion, recomendaciones
- Frontend: Next.js 15 (App Router) + Tailwind CSS + Bun
- Persistencia: SQLite (dev) o PostgreSQL (prod)
- Comunicación: HTTP/JSON (axios/fetch desde frontend)
- Almacenamiento de medios: carpeta media/ (recursos de cursos)

---

## 📁 Estructura del proyecto

```
Proyecto_Web/
│
├─ sistema_educativo/                # Backend Django
│  ├─ usuarios/                      # Usuarios y autenticación
│  ├─ cursos/                        # Cursos, fases, lecciones, recursos
│  ├─ atencion/                      # Monitoreo de atención (OpenCV/MediaPipe)
│  ├─ recomendaciones/               # Recomendaciones IA (Claude/Anthropic)
│  ├─ media/                         # Archivos subidos (recursos multimedia)
│  └─ sistema_educativo/             # Configuración principal de Django
│
├─ frontend/                         # Frontend Next.js + Tailwind
│  ├─ src/
│  │  ├─ app/                        # Páginas y rutas (App Router)
│  │  ├─ components/                 # Componentes compartidos
│  │  ├─ services/                   # Servicios de API (axios/fetch)
│  │  └─ styles/                     # Estilos globales
│  └─ public/                        # Recursos estáticos
│
└─ README.md
```

---

## ⚙️ Requisitos

- Python 3.10+ y pip
- Node.js 20+ y Bun (https://bun.sh/) — opcionalmente npm/pnpm
- SQLite (dev) o PostgreSQL (prod)
- Git (opcional)

---

## 🔧 Variables de entorno

Configura variables en archivos .env (backend) y .env.local (frontend).

Ejemplo para Django (crear archivo sistema_educativo/.env):
```
SECRET_KEY=change_me
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# CORS (ajusta el puerto del frontend)
CORS_ALLOWED_ORIGINS=http://localhost:3000

# Base de datos (usar DATABASE_URL en prod; por defecto SQLite en settings.py)
# DATABASE_URL=postgres://user:pass@localhost:5432/mi_db

# Recomendaciones IA (según recomendaciones/claude_api.py)
ANTHROPIC_API_KEY=tu_api_key

# (Opcional) JWT lifetimes si usas SimpleJWT (revisar settings.py para nombres)
# ACCESS_TOKEN_LIFETIME=...
# REFRESH_TOKEN_LIFETIME=...
```

Ejemplo para Next.js (crear archivo frontend/.env.local):
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Notas:
- Mantén las claves fuera del control de versiones.
- En producción define DEBUG=False, SECRET_KEY seguro, ALLOWED_HOSTS y CORS adecuados.

---

## 🛠️ Instalación y ejecución (desarrollo)

1) Clonar el repo
```sh
git clone <URL-del-repo>
cd Proyecto_Web
```

2) Backend (Django)
```sh
cd sistema_educativo
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/Mac:
# source venv/bin/activate

pip install -r requirements.txt
# Crea sistema_educativo/.env con las variables anteriores
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```
Backend disponible en: http://localhost:8000

3) Frontend (Next.js)
```sh
cd ../frontend
# Crea frontend/.env.local con NEXT_PUBLIC_API_URL
bun install          # o npm install / pnpm install
bun run dev          # o npm run dev / pnpm dev
```
Frontend disponible en: http://localhost:3000

---

## 🔑 Acceso

- Inicia sesión en /login con el superusuario creado.
- Panel de administración: /dashboard/admin
- Panel docente y estudiante disponibles según rol e inscripciones.

---

## 🖥️ Funcionalidades por rol

- Admin:
  - CRUD de usuarios y cursos
  - Inscripciones (individual y CSV con feedback)
- Docente:
  - Gestión de estructura del curso (fases, lecciones, recursos)
  - Recursos con flags: permite_monitoreo, es_evaluable
  - Creación masiva de sesiones de monitoreo
  - Reportes y exportación CSV
  - Historial de recomendaciones IA por curso
- Estudiante:
  - Acceso a cursos y recursos
  - Visualización de recursos con consentimiento para monitoreo
  - Sesiones de monitoreo asociadas a actividades

---

## 👀 Módulo de Atención (opcional)

- Requisitos Python: opencv-python, mediapipe, numpy (ver requirements.txt).
- Permisos de cámara en navegador/sistema (desbloquear antivirus, cerrar apps que usen la cámara).
- Flujo:
  1) El estudiante accede a un recurso con “permite_monitoreo”.
  2) Se crea/recupera su sesión de monitoreo.
  3) Se ejecuta el monitoreo por tiempo definido y se guarda el score/métricas.
- Lógica de visión: sistema_educativo/atencion/scripts/deteccion_facial.py
- Endpoints: ver sistema_educativo/atencion/urls.py y views.py.

---

## 🤖 Recomendaciones IA (opcional)

- Backend en sistema_educativo/recomendaciones/claude_api.py.
- Requiere ANTHROPIC_API_KEY en el .env del backend.
- Historial docente en: /dashboard/docente/[cursoId]/recomendaciones
- Endpoints: ver sistema_educativo/recomendaciones/urls.py y views.py.

---

## 🔁 Flujos clave

- Monitoreo de atención
  1) Crear/obtener sesión para estudiante y recurso.
  2) Ejecutar monitoreo (OpenCV/MediaPipe).
  3) Persistir score y métricas; visualizar en reportes.
- Recomendaciones IA
  1) Generación en backend a partir de atención/nota/contexto.
  2) Docente aprueba/descarta; queda trazabilidad por curso.
- Gestión docente
  - Crear/editar recursos; marcar “permite_monitoreo” y “es_evaluable”.
  - Crear sesiones de monitoreo para todo el curso.

---

## 🔌 Endpoints (resumen)

- Usuarios: /api/usuarios/…
- Cursos y estructura: /api/cursos/, /api/fases/, /api/lecciones/, /api/recursos/
- Inscripciones: /api/inscripciones/
- Atención: /api/atencion/… (sesiones y monitoreo)
- Recomendaciones: /api/recomendaciones/…
Consultar los urls.py y serializers.py de cada app para contratos exactos.

---

## 🧪 Pruebas

Backend:
```sh
cd sistema_educativo
venv\Scripts\activate
python manage.py test
```
Front (si agregas tests): usa tu runner preferido (Jest/RTL/Vitest).

---

## 🐞 Troubleshooting

- 401/403 o CORS: revisa CORS_ALLOWED_ORIGINS y ALLOWED_HOSTS; tokens JWT válidos.
- Migraciones: python manage.py makemigrations && python manage.py migrate.
- Cámara no disponible: concede permiso en el navegador; cierra apps que usen la cámara.
- Bun en Windows: si falla, usa npm/pnpm (los comandos equivalentes funcionan).
- Rutas de API hardcodeadas: usa NEXT_PUBLIC_API_URL y un cliente axios común.

---

## 🚢 Despliegue (guía rápida)

Backend (Linux):
- Variables de entorno seguras; DEBUG=False.
- Base de datos PostgreSQL (DATABASE_URL).
- collectstatic: python manage.py collectstatic.
- Servir con gunicorn/uvicorn + nginx; servir STATIC y MEDIA.

Frontend:
- Configura NEXT_PUBLIC_API_URL con la URL pública del backend.
- Build: bun run build (o npm run build).
- Despliegue en Vercel/Netlify u otro hosting estático/SSR compatible.

---

## 👨‍💻 Convenios de desarrollo

- Formato y linting: usa el ESLint/Prettier del frontend.
- Commits claros y descriptivos.
- Evitar claves en el repositorio (usa .env y secretos del proveedor).

---

## 👥 Autores

- Marlon Chacón
- Jordy Quimbita

---

## 📄 Licencia

Uso académico. Adáptalo a tus necesidades respetando las licencias de dependencias.