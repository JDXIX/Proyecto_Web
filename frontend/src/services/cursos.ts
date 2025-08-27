import axios from "axios";
import type { Curso, CreateCursoData, Nivel, Fase, Recurso } from "../types";

const API_URL = "http://localhost:8000/api/cursos/";

export async function getCursos(token: string): Promise<Curso[]> {
  const res = await axios.get<Curso[]>(API_URL, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}

export async function crearCurso(data: CreateCursoData, token: string): Promise<Curso> {
  const res = await axios.post<Curso>(API_URL, data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}

export async function editarCurso(id: string, data: Partial<CreateCursoData>, token: string): Promise<Curso> {
  const res = await axios.put<Curso>(`${API_URL}${id}/`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}

export async function eliminarCurso(id: string, token: string): Promise<void> {
  await axios.delete(`${API_URL}${id}/`, {
    headers: { Authorization: `Bearer ${token}` }
  });
}

export async function getCursoDetalle(token: string, cursoId: string): Promise<Curso> {
  const res = await fetch(`${API_URL}${cursoId}/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

export async function getRecursoDetalle(token: string, recursoId: string): Promise<Recurso> {
  const res = await fetch(`http://localhost:8000/api/recursos/${recursoId}/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

export async function getCursosDocente(token: string): Promise<Curso[]> {
  const res = await axios.get<Curso[]>("http://localhost:8000/api/cursos/docente/", {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}

// Obtener detalle de un curso (para docente)
export async function getCursoDetalleDocente(cursoId: string, token: string): Promise<Curso> {
  const res = await axios.get<Curso>(`${API_URL}${cursoId}/`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}

// Obtener estudiantes inscritos en un curso
export async function getEstudiantesCurso(cursoId: string, token: string): Promise<unknown[]> {
  const res = await axios.get(`${API_URL}${cursoId}/estudiantes/`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}

// Obtener niveles de un curso
export async function getNiveles(cursoId: string, token: string): Promise<Nivel[]> {
  const res = await axios.get<Nivel[]>(`http://localhost:8000/api/niveles/?curso=${cursoId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}

// Obtener lecciones (fases) de un nivel
export async function getLecciones(nivelId: string, token: string): Promise<Fase[]> {
  const res = await axios.get<Fase[]>(`http://localhost:8000/api/fases/?nivel=${nivelId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}

// Obtener recursos de una lección (fase)
export async function getRecursos(leccionId: string, token: string): Promise<Recurso[]> {
  const res = await axios.get<Recurso[]>(`http://localhost:8000/api/recursos/?fase=${leccionId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}

export async function crearNivel(data: Omit<Nivel, 'id'>, token: string): Promise<Nivel> {
  const res = await axios.post<Nivel>("http://localhost:8000/api/niveles/", data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}

export async function editarNivel(id: string, data: Partial<Omit<Nivel, 'id'>>, token: string): Promise<Nivel> {
  const res = await axios.put<Nivel>(`http://localhost:8000/api/niveles/${id}/`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}

export async function crearLeccion(data: Omit<Fase, 'id'>, token: string): Promise<Fase> {
  const res = await axios.post<Fase>("http://localhost:8000/api/fases/", data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}

export async function editarLeccion(id: string, data: Partial<Omit<Fase, 'id'>>, token: string): Promise<Fase> {
  const res = await axios.put<Fase>(`http://localhost:8000/api/fases/${id}/`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}

export async function crearRecurso(data: FormData, token: string): Promise<Recurso> {
  const res = await axios.post<Recurso>("http://localhost:8000/api/recursos/", data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}

export async function editarRecurso(id: string, data: FormData, token: string): Promise<Recurso> {
  const res = await axios.put<Recurso>(`http://localhost:8000/api/recursos/${id}/`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}

export async function eliminarNivel(id: string, token: string): Promise<void> {
  await axios.delete(`http://localhost:8000/api/niveles/${id}/`, {
    headers: { Authorization: `Bearer ${token}` }
  });
}

export async function eliminarLeccion(id: string, token: string): Promise<void> {
  await axios.delete(`http://localhost:8000/api/fases/${id}/`, {
    headers: { Authorization: `Bearer ${token}` }
  });
}

export async function eliminarRecurso(id: string, token: string): Promise<void> {
  await axios.delete(`http://localhost:8000/api/recursos/${id}/`, {
    headers: { Authorization: `Bearer ${token}` }
  });
}