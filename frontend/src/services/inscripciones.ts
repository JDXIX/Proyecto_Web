import axios from "axios";

const API_URL = "http://localhost:8000/api/inscripciones/";

export async function inscribirEstudiante(estudiante: string, curso: string) {
  const token = localStorage.getItem("token");
  const res = await axios.post(
    API_URL,
    { estudiante, curso },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
}