# 🚀 **AttentionTrack — Sistema Educativo Inteligente con Monitoreo de Atención**

**AttentionTrack** es un sistema educativo web completo que integra gestión académica, monitoreo de atención basado en visión por computadora (EAR, MAR, Head Pose) y un modelo de **Random Forest** para clasificar niveles de atención en tiempo real, todo completamente integrado en un entorno web moderno.

Este sistema fue reconstruido, optimizado y extendido a partir del repositorio original, ahora con un pipeline de atención **100% web**, sin procesamiento local.

---

## ✨ **Características principales**

### 🎓 Gestión Académica Completa

- CRUD de usuarios con roles: administrador, docente y estudiante
- Gestión de cursos, niveles, fases y recursos
- Inscripciones individuales
- Panel administrativo en Django Admin

### 👁️ **Módulo de Atención (Actualizado – Atención Web con ML)**

- Procesamiento de cámara desde el navegador (getUserMedia)
- Pipeline de métricas:
  - **EAR (Eye Aspect Ratio)**
  - **MAR (Mouth Aspect Ratio)**
  - **Head Pose (Yaw, Pitch, Roll)**
- Modelo de Machine Learning:
  - **Random Forest entrenado en dataset propio**
- Captura y almacenamiento de métricas por frame
- Clasificación de nivel de atención por segundo
- Dashboard docente (pendiente de UI final)

### 🖥️ Frontend Moderno

- Next.js 15 (App Router)
- Tailwind CSS
- Bun como runtime
- Integración directa con el backend

### ⚙️ Backend Robusto

- Django REST Framework
- Scripts dedicados:
  - procesamiento_mediapipe.py
  - modelo_atencion_rf.py (Random Forest)
- Sesiones automáticas de monitoreo por curso y recurso
- API modular por aplicaciones

---

## 🧭 **Arquitectura General**

```
Proyecto_Web/
│
├─ sistema_educativo/                # Backend Django
│  ├─ usuarios/                      # Autenticación, perfiles y roles
│  ├─ cursos/                        # Cursos, niveles, fases y recursos
│  ├─ atencion/                      # Monitoreo con MediaPipe + RF
│  │   ├─ scripts/
│  │   │   ├─ procesamiento_mediapipe.py
│  │   │   ├─ modelo_atencion_rf.py
│  │   │   ├─ entrenar_modelo.py
│  │   │   └─ datasets (opcional)
│  ├─ recomendaciones/
│  ├─ media/                         # Recursos subidos por docentes
│  └─ sistema_educativo/             # Configuración Django
│
├─ frontend/                         # Next.js 15 + Tailwind + Bun
│  ├─ src/app/
│  ├─ src/services/
│  └─ public/
│
└─ README.md
```

---

## ⚙️ **Requisitos**

### Backend

- Python 3.10+
- pip
- SQLite (dev) o PostgreSQL (prod)

### Frontend

- Node.js 20+
- Bun 

---

## 🔧 **Variables de Entorno**

### Backend – `sistema_educativo/.env`

```env
SECRET_KEY=change_me
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000

# Modelo de IA opcional
ANTHROPIC_API_KEY=

# Base de datos (prod)
# DATABASE_URL=postgres://user:pass@host:5432/dbname
```

### Frontend – `frontend/.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 🛠️ Instalación y Ejecución (Modo Desarrollo)

### 1) Clonar

```bash
git clone <URL-del-repo>
cd Proyecto_Web
```

### 2) Backend

```bash
cd sistema_educativo
python -m venv venv
venv\Scripts\activate

pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

Backend disponible en:
👉 `http://localhost:8000`

En consola verás:
- `Modelo Random Forest cargado correctamente.`
- `Características esperadas: ['EAR', 'MAR', 'Yaw', 'Pitch', 'Roll']`

### 3) Frontend

```bash
cd ../frontend
bun install
bun run dev
```

Frontend disponible en:
👉 `http://localhost:3000`

> Si en Windows `bun run dev` da problemas, usa `npm run dev` o `pnpm dev`.

---

## 🔐 Accesos

- **Panel Admin Django**: [http://localhost:8000/admin](http://localhost:8000/admin)
- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Login**: `/login`

### Roles disponibles

- **Admin**: gestión completa de usuarios, cursos e inscripciones
- **Docente**: gestión de fases, lecciones, recursos y sesiones de monitoreo
- **Estudiante**: acceso a cursos inscritos y participación en monitoreo de atención

---

## 🖥️ Funcionalidades por rol

### Admin

- CRUD de usuarios (incluye cambio de rol y reset de contraseña)
- Creacion y edición de cursos
- Configuración básica del sistema

### Docente

- Crear/editar:
  - Fases, lecciones y recursos
  - Flags por recurso: `permite_monitoreo`, `es_evaluable`
- **Inscripciones**:
  - Individual desde el panel
  - Masiva mediante CSV (con feedback de errores)
- **Sesiones de monitoreo**:
  - Crear sesiones en lote para todos los estudiantes: `/api/sesiones/crear-multiples/`
  - Consultar lista de sesiones por recurso
- **Notas y reportes**:
  - Visualizar resultados de atención 

### Estudiante

- Ver cursos y recursos disponibles
- Entrar a recursos con `permite_monitoreo=True`
- Usar la cámara desde el navegador para monitoreo de atención

---

## 🧠 Módulo de Atención 

### 🆕 **Procesamiento es 100% web**

### Pipeline completo:

1. El **docente** crea un recurso con `permite_monitoreo = True`
2. El docente crea **sesiones masivas** para todos los estudiantes del curso
   → `POST /api/sesiones/crear-multiples/`
3. El **estudiante** abre el recurso → se activa la cámara
4. El frontend envía frames al backend:
   → `POST /api/sesiones/<id>/monitoreo-atencion/`
5. El backend ejecuta:
   - `procesamiento_mediapipe.py` → extrae EAR, MAR, Head Pose
   - `modelo_atencion_rf.py` → clasifica con Random Forest
6. Guarda métricas en `AtencionVisual`
7. Calcula nivel de atención + score de atención

### Modelo de datos clave

- **SesionMonitoreo**: gestiona cada sesión de monitoreo (estudiante, recurso, fase, timestamps)
- **AtencionVisual**: almacena score de atención calculado por Random Forest
- **NotaAcademica**: nota obtenida en actividades evaluables
- **Nota combinada**: mezcla ponderada de atención + desempeño académico

### Características extraídas

- **EAR (Eye Aspect Ratio)**: detección de parpadeo y fatiga visual
- **MAR (Mouth Aspect Ratio)**: detección de bostezos y distracción
- **Head Pose (Yaw, Pitch, Roll)**: orientación de la cabeza para detectar si mira la pantalla

---

## 📡 Endpoints Relevantes

### Sesiones de Monitoreo

```
POST /api/sesiones/crear-multiples/
POST /api/sesiones/<id>/monitoreo-atencion/
GET  /api/sesiones/?recurso=<uuid>
```

### Atención Visual

```
GET /api/atencion-visual/
```

### Cursos y Estructura

```
GET  /api/cursos/
GET  /api/fases/
GET  /api/lecciones/
GET  /api/recursos/
```

### Usuarios e Inscripciones

```
GET  /api/usuarios/
POST /api/inscripciones/
```


## 🧪 Pruebas

### Backend

```bash
cd sistema_educativo
venv\Scripts\activate
python manage.py test
```

### Frontend

```bash
cd frontend
bun test  # si tienes tests configurados
```

---

## 🛑 Errores

### Errores comunes

- **405 Method Not Allowed**
  → El router no reconoce el método o falta el endpoint
  
- **CORS bloqueando**
  → Revisar `CORS_ALLOWED_ORIGINS` en `.env`
  
- **La cámara no se activa**
  → Cerrar apps que usen cámara (Zoom, Teams, OBS)
  → Verificar permisos en el navegador
  
- **Modelo Random Forest no carga**
  → Verificar ruta de `modelo_atencion_rf.pkl`
  → Confirmar compatibilidad de versiones scikit-learn/numpy

- **Errores 401/403**
  → Revisar configuración JWT
  → Verificar que el token se envía en headers: `Authorization: Bearer <token>`

- **Problemas con migraciones**
  ```bash
  python manage.py makemigrations
  python manage.py migrate
  ```

---


## 👤 Autor

**Ariel Nuñez**

Desarrollador y mantenedor principal del proyecto AttentionTrack.

---

## 📄 Licencia

Proyecto de uso académico y de práctica profesional.
Puedes adaptarlo y extenderlo respetando las licencias de las dependencias utilizadas.