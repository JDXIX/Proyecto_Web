import axios from "axios";

const API_URL = "http://localhost:8000/api/inscripciones/";

export async function inscribirEstudiante(estudiante: number, curso: number) {
  const token = localStorage.getItem("token");
  const res = await axios.post(
    API_URL,
    { estudiante, curso },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
}

export async function getInscripcionesPorEstudiante(estudiante: number) {
  const token = localStorage.getItem("token");
  const res = await axios.get(`${API_URL}?estudiante=${estudiante}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}