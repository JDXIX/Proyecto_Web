import axios from "axios";

const API_URL = "http://localhost:8000/api/token/";
const REGISTER_URL = "http://localhost:8000/api/usuarios/";
const PERFIL_URL = "http://localhost:8000/api/usuarios/me/";

// Login: obtiene el token y luego el perfil para guardar el user_id
export async function login(username: string, password: string) {
  try {
    // 1. Login para obtener el token
    const response = await axios.post(API_URL, { username, password });
    const { access, refresh } = response.data;
    localStorage.setItem("token", access);
    localStorage.setItem("refresh", refresh);

    // 2. Obtener el perfil del usuario autenticado
    const perfilResp = await axios.get(PERFIL_URL, {
      headers: { Authorization: `Bearer ${access}` },
    });
    const user = perfilResp.data;
    localStorage.setItem("user_id", user.id);

    // Puedes retornar el usuario y los tokens si lo necesitas
    return { user, access, refresh };
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
        (typeof error.response?.data === "string"
          ? error.response.data
          : "Error al registrar usuario")
    );
  }
}