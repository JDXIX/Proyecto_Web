import axios from "axios";
import type { RegisterData, AuthTokens, AuthUser } from "../types";

const API_URL = "http://localhost:8000/api/token/";
const REGISTER_URL = "http://localhost:8000/api/usuarios/";
const PERFIL_URL = "http://localhost:8000/api/usuarios/me/";

interface LoginResponse {
  user: AuthUser;
  access: string;
  refresh: string;
}

// Login: obtiene el token y luego el perfil para guardar el user_id
export async function login(username: string, password: string): Promise<LoginResponse> {
  try {
    // 1. Login para obtener el token
    const response = await axios.post<AuthTokens>(API_URL, { username, password });
    const { access, refresh } = response.data;
    localStorage.setItem("token", access);
    localStorage.setItem("refresh", refresh);

    // 2. Obtener el perfil del usuario autenticado
    const perfilResp = await axios.get<AuthUser>(PERFIL_URL, {
      headers: { Authorization: `Bearer ${access}` },
    });
    const user = perfilResp.data;
    localStorage.setItem("user_id", user.id);

    // Puedes retornar el usuario y los tokens si lo necesitas
    return { user, access, refresh };
  } catch (error: unknown) {
    const axiosError = error as { response?: { data?: { detail?: string } } };
    throw axiosError.response?.data?.detail || "Error de autenticación";
  }
}

export async function register(data: RegisterData): Promise<AuthUser> {
  try {
    const res = await axios.post<AuthUser>(REGISTER_URL, data);
    return res.data;
  } catch (error: unknown) {
    const axiosError = error as { 
      response?: { 
        data?: { 
          detail?: string;
        } | string; 
      } 
    };
    throw new Error(
      axiosError.response?.data?.detail ||
        (typeof axiosError.response?.data === "string"
          ? axiosError.response.data
          : "Error al registrar usuario")
    );
  }
}