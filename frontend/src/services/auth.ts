import axios from "axios";

const API_URL = "http://localhost:8000/api/token/";
const REGISTER_URL = "http://localhost:8000/api/usuarios/";

export async function login(username: string, password: string) {
  try {
    const response = await axios.post(API_URL, { username, password });
    return response.data; // { access, refresh }
  } catch (error: any) {
    throw error.response?.data?.detail || "Error de autenticación";
  }
}

export async function register(data: any) {
  try {
    const res = await axios.post(REGISTER_URL, data);
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.detail ||
      (typeof error.response?.data === "string" ? error.response.data : "Error al registrar usuario")
    );
  }
}