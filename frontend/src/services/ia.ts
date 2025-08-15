import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Generar recomendación IA para un estudiante y fase
export async function generarRecomendacionIA(
  estudianteId: string,
  faseId: string,
  atencion: number,
  nota: number,
  token: string
) {
  const res = await axios.post(
    `${API_URL}/api/recomendaciones/generar/`,
    { estudiante: estudianteId, fase: faseId, atencion, nota },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return res.data;
}