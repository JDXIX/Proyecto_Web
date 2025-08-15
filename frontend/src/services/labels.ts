import axios from "axios";

const API = "http://localhost:8000/api";

const userCache = new Map<string, string>();
const leccionCache = new Map<string, string>();

export async function getUsuarioNombre(id: string, token: string) {
  if (!id) return "";
  if (userCache.has(id)) return userCache.get(id)!;
  const res = await axios.get(`${API}/usuarios/${id}/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const u = res.data || {};
  const nombre = `${u.first_name || ""} ${u.last_name || ""}`.trim() || u.username || u.email || id;
  userCache.set(id, nombre);
  return nombre;
}

export async function getLeccionNombre(id: string, token: string) {
  if (!id) return "";
  if (leccionCache.has(id)) return leccionCache.get(id)!;
  const res = await axios.get(`${API}/fases/${id}/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const nombre = res.data?.nombre || id;
  leccionCache.set(id, nombre);
  return nombre;
}