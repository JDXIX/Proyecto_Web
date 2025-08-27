// Common types for the application

export interface Usuario {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  rol: 'admin' | 'docente' | 'estudiante';
  activo: boolean;
  fecha_registro: string;
}

export interface CreateUsuarioData {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  rol: 'admin' | 'docente' | 'estudiante';
  activo?: boolean;
}

export interface UpdateUsuarioData {
  username?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  password?: string;
  rol?: 'admin' | 'docente' | 'estudiante';
  activo?: boolean;
}

export interface Curso {
  id: string;
  nombre: string;
  descripcion: string;
  activo: boolean;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface CreateCursoData {
  nombre: string;
  descripcion: string;
  activo?: boolean;
}

export interface Nivel {
  id: string;
  nombre: string;
  descripcion: string;
  curso: string;
  orden: number;
}

export interface Fase {
  id: string;
  nombre: string;
  descripcion: string;
  nivel: string;
  orden: number;
}

export interface Recurso {
  id: string;
  nombre: string;
  tipo: 'video' | 'audio' | 'documento' | 'enlace';
  url?: string;
  archivo?: string;
  permite_monitoreo: boolean;
  es_evaluable: boolean;
  duracion?: number;
  fase: string;
}

export interface SesionMonitoreo {
  id: string;
  estudiante: string;
  recurso: string;
  fase: string;
  inicio: string;
  fin?: string;
  duracion?: string;
  estado: 'activa' | 'finalizada' | 'cancelada';
}

export interface AtencionVisual {
  id: string;
  sesion: string;
  estudiante: string;
  recurso: string;
  fase: string;
  score_atencion?: number;
  patrones?: Record<string, unknown>;
  fecha: string;
}

export interface Recomendacion {
  id: string;
  estudiante: string;
  fase: string;
  mensaje: string;
  acciones: Array<{
    tipo: string;
    descripcion: string;
    recurso?: Recurso;
  }>;
  estado: 'pendiente' | 'aprobada' | 'descartada';
  fecha_creacion: string;
}

export interface HistorialEstudiante {
  id: string;
  estudiante: string;
  curso: string;
  fase: string;
  score_atencion?: number;
  nota_academica?: number;
  recomendacion?: string;
  estado: 'Listo' | 'Observacion' | 'Refuerzo';
  fecha: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData extends CreateUsuarioData {
  confirmPassword?: string;
}

export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  success?: boolean;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  rol: string;
}