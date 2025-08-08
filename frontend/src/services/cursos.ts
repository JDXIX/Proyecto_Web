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