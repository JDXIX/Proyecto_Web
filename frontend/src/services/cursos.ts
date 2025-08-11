import axios from "axios";

const API_URL = "http://localhost:8000/api/cursos/";


export async function getCursos(token: string) {
  const res = await axios.get(API_URL, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}

export async function crearCurso(data: any, token: string) {
  const res = await axios.post(API_URL, data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}

export async function editarCurso(id: string, data: any, token: string) {
  const res = await axios.put(`${API_URL}${id}/`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}

export async function eliminarCurso(id: string, token: string) {
  await axios.delete(`${API_URL}${id}/`, {
    headers: { Authorization: `Bearer ${token}` }
  });
}

export async function getCursoDetalle(token: string, cursoId: string) {
  const res = await fetch(`/api/cursos/${cursoId}/detalle/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

export async function getRecursoDetalle(token: string, recursoId: string) {
  const res = await fetch(`/api/recursos/${recursoId}/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

export async function getCursosDocente(token: string) {
  const res = await axios.get("http://localhost:8000/api/cursos/docente/", {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}

// ...existing code...

// Obtener detalle de un curso (para docente)
export async function getCursoDetalleDocente(cursoId: string, token: string) {
  const res = await axios.get(`${API_URL}${cursoId}/`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}

// Obtener estudiantes inscritos en un curso
export async function getEstudiantesCurso(cursoId: string, token: string) {
  const res = await axios.get(`${API_URL}${cursoId}/estudiantes/`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}

// Obtener niveles de un curso
export async function getNiveles(cursoId: string, token: string) {
  const res = await axios.get(`http://localhost:8000/api/niveles/?curso=${cursoId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}

// Obtener lecciones (fases) de un nivel
export async function getLecciones(nivelId: string, token: string) {
  const res = await axios.get(`http://localhost:8000/api/fases/?nivel=${nivelId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}

// Obtener recursos de una lección (fase)
export async function getRecursos(leccionId: string, token: string) {
  const res = await axios.get(`http://localhost:8000/api/recursos/?fase=${leccionId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}

export async function crearNivel(data: any, token: string) {
  const res = await axios.post("http://localhost:8000/api/niveles/", data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}

export async function editarNivel(id: string, data: any, token: string) {
  const res = await axios.put(`http://localhost:8000/api/niveles/${id}/`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}

export async function crearLeccion(data: any, token: string) {
  const res = await axios.post("http://localhost:8000/api/fases/", data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}

export async function editarLeccion(id: string, data: any, token: string) {
  const res = await axios.put(`http://localhost:8000/api/fases/${id}/`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}

export async function crearRecurso(data: FormData, token: string) {
  const res = await axios.post("http://localhost:8000/api/recursos/", data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}

export async function editarRecurso(id: string, data: FormData, token: string) {
  const res = await axios.put(`http://localhost:8000/api/recursos/${id}/`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}

export async function eliminarNivel(id: string, token: string) {
  await axios.delete(`http://localhost:8000/api/niveles/${id}/`, {
    headers: { Authorization: `Bearer ${token}` }
  });
}

export async function eliminarLeccion(id: string, token: string) {
  await axios.delete(`http://localhost:8000/api/fases/${id}/`, {
    headers: { Authorization: `Bearer ${token}` }
  });
}

export async function eliminarRecurso(id: string, token: string) {
  await axios.delete(`http://localhost:8000/api/recursos/${id}/`, {
    headers: { Authorization: `Bearer ${token}` }
  });
}