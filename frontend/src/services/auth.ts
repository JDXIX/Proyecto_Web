import axios from "axios";

const API_URL = "http://localhost:8000/api/token/";

export async function login(username: string, password: string) {
  try {
    const response = await axios.post(API_URL, { username, password });
    return response.data; // { access, refresh }
  } catch (error: any) {
    throw error.response?.data?.detail || "Error de autenticación";
  }
}