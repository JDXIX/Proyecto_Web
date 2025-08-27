import axios from "axios";
import type { Usuario, CreateUsuarioData, UpdateUsuarioData } from "../types";

const API_URL = "http://localhost:8000/api/usuarios/";

export async function getUsuarios(token: string): Promise<Usuario[]> {
  const res = await axios.get<Usuario[]>(API_URL, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}

export async function crearUsuario(data: CreateUsuarioData, token: string): Promise<Usuario> {
  const res = await axios.post<Usuario>(API_URL, data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}

export async function editarUsuario(id: string, data: UpdateUsuarioData, token: string): Promise<Usuario> {
  const res = await axios.put<Usuario>(`${API_URL}${id}/`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}

export async function eliminarUsuario(id: string, token: string): Promise<void> {
  await axios.delete(`${API_URL}${id}/`, {
    headers: { Authorization: `Bearer ${token}` }
  });
}

export async function getUsuarioActual(token: string): Promise<Usuario> {
  // Si tienes un endpoint tipo /api/usuarios/me/
  const res = await axios.get<Usuario>("http://localhost:8000/api/usuarios/me/", {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}