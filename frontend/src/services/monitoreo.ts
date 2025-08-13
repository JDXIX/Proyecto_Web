import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Iniciar monitoreo de atención (POST a una sesión específica)
export async function iniciarMonitoreo(
  sesionId: string,
  atencion: number,
  token: string
) {
  const res = await axios.post(
    `${API_URL}/api/sesiones/${sesionId}/monitoreo-atencion/`,
    { atencion },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return res.data;
}

// Crear sesiones de monitoreo para todos los estudiantes de un recurso/fase
export async function crearSesionesMonitoreo(
  { recursoId, faseId }: { recursoId: string; faseId: string },
  token: string
) {
  const res = await axios.post(
    `${API_URL}/api/sesiones/crear-multiples/`,
    { recurso: recursoId, fase: faseId },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return res.data;
}