import axios from "axios";

const API_URL = "http://localhost:8000/api/usuarios/";

export async function getUsuarios(token: string) {
  const res = await axios.get(API_URL, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}

export async function crearUsuario(data: any, token: string) {
  const res = await axios.post(API_URL, data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}

export async function editarUsuario(id: string, data: any, token: string) {
  const res = await axios.put(`${API_URL}${id}/`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}

export async function eliminarUsuario(id: string, token: string) {
  await axios.delete(`${API_URL}${id}/`, {
    headers: { Authorization: `Bearer ${token}` }
  });
}
export async function getUsuarioActual(token: string) {
  // Si tienes un endpoint tipo /api/usuarios/me/
  const res = await axios.get("http://localhost:8000/api/usuarios/me/", {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}