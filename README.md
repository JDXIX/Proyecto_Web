# Sistema Educativo Web

Sistema integral de gestión educativa con panel de administración, gestión de usuarios, cursos e inscripciones, desarrollado con **Django REST Framework** (backend) y **Next.js 15 + Bun + Tailwind CSS** (frontend).

---

## 🚀 Características principales

- **Panel de administración** con autenticación JWT y protección por roles.
- **Gestión de usuarios**: crear, editar (incluyendo rol y estado), eliminar y listar usuarios.
- **Gestión de cursos**: crear, editar, eliminar y listar cursos académicos.
- **Inscripción de estudiantes**: inscripción individual y masiva por archivo CSV.
- **Interfaz moderna y responsive** con sidebar, feedback visual y navegación clara.
- **Backend modular** con apps separadas para usuarios, cursos, atención y recomendaciones.

---

## 📁 Estructura del proyecto

```

Proyecto\_Web/
│
├── sistema\_educativo/         # Backend Django
│   ├── usuarios/              # Gestión de usuarios y autenticación
│   ├── cursos/                # Gestión de cursos
│   ├── atencion/              # Módulo de atención (opcional)
│   ├── recomendaciones/       # Módulo de recomendaciones (opcional)
│   └── sistema\_educativo/     # Configuración principal Django
│
├── frontend/                  # Frontend Next.js + Bun + Tailwind
│   ├── src/
│   │   ├── app/               # Páginas y rutas (App Router)
│   │   ├── components/        # Componentes reutilizables (Sidebar, Navbar, etc.)
│   │   ├── services/          # Lógica de conexión con la API
│   │   └── styles/            # Estilos globales
│   └── public/                # Imágenes y recursos estáticos
│
└── README.md                  # Este archivo

````

---

## ⚙️ Requisitos

- **Python 3.10+** y **pip**
- **Node.js 20+** y **Bun** ([https://bun.sh/](https://bun.sh/))
- **PostgreSQL** o **SQLite** (según configuración Django)
- **Git** (opcional, recomendado)

---

## 🛠️ Instalación y ejecución

### 1. Clona el repositorio

```sh
git clone <URL-del-repo>
cd Proyecto_Web
````

### 2. Backend (Django)

```sh
cd sistema_educativo
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser  # Crea un usuario admin
python manage.py runserver
```

> El backend estará disponible en: `http://localhost:8000`

### 3. Frontend (Next.js + Bun)

```sh
cd ../frontend
bun install
bun run dev
```

> El frontend estará disponible en: `http://localhost:3000`

---

## 🔑 Acceso al sistema

* Ingresa a `/login` con tu usuario administrador.
* Accede al panel en `/dashboard/admin`.

---

## 🖥️ Funcionalidades principales

* **Gestión de Usuarios**:
  Crear, editar (rol, estado, contraseña), eliminar y listar usuarios.

* **Gestión de Cursos**:
  Crear, editar, eliminar y listar cursos.

* **Inscripción de Estudiantes**:
  Inscribir estudiantes a cursos de forma individual o masiva (subiendo CSV).

* **Protección de rutas**:
  Solo usuarios con rol admin pueden acceder al panel de administración.

* **Feedback visual**:
  Mensajes claros de éxito y error en todas las operaciones.

---

## 📝 Notas de desarrollo

* **Variables de entorno**:
  Configura tus variables en `.env` tanto para Django como para Next.js si usas bases de datos externas o despliegue.

* **CORS**:
  El backend debe permitir peticiones desde el frontend (usa `django-cors-headers`).

* **Servicios de API**:
  Toda la comunicación frontend-backend se realiza vía servicios en `frontend/src/services/`.

---

## 📦 Despliegue

* Puedes desplegar el backend en **Render**, **Railway**, **Heroku**, etc.
* El frontend puede desplegarse en **Vercel**, **Netlify**, etc.
* Asegúrate de configurar correctamente las URLs de la API en producción.

---

## 🧪 Pruebas

* El backend incluye archivos de tests para cada app.
* Se recomienda agregar pruebas unitarias y de integración para endpoints críticos.

---

## 👨‍💻 Autores

* \[Tu nombre o equipo]
* \[Tu correo o contacto]

---

## 📄 Licencia

Este proyecto es de uso académico y puede ser adaptado según tus necesidades.

