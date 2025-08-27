import axios from "axios";
import type { SesionMonitoreo } from "../types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface MonitoreoResponse {
  sesion: SesionMonitoreo;
  atencion_visual?: {
    score_atencion: number;
    patrones: Record<string, unknown>;
  };
  mensaje?: string;
}

interface NotaCombinada {
  estudiante: string;
  recurso: string;
  score_atencion?: number;
  nota_academica?: number;
  nota_combinada: number;
}

// Iniciar monitoreo de atención (POST a una sesión específica)
// El backend calcula el score; enviamos opcionalmente la duración.
export async function iniciarMonitoreo(
  sesionId: string,
  token: string,
  duracion?: number
): Promise<MonitoreoResponse> {
  const body: { duracion?: number } = {};
  if (duracion) body.duracion = duracion;

  const res = await axios.post<MonitoreoResponse>(
    `${API_URL}/api/sesiones/${sesionId}/monitoreo-atencion/`,
    body,
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
): Promise<{ sesiones_creadas: number; mensaje: string }> {
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

// Crear (o devolver) sesión de monitoreo para el estudiante autenticado y un recurso
export async function crearSesionParaMi(recursoId: string, token: string): Promise<{ id: string }> {
  const res = await axios.post<{ id: string }>(
    `${API_URL}/api/sesiones/crear-para-mi/`,
    { recurso: recursoId },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return res.data; // { id }
}

// Obtener nota combinada de un estudiante para un recurso
export async function obtenerNotaCombinada(
  estudianteId: string,
  recursoId: string,
  token: string
): Promise<NotaCombinada> {
  const res = await axios.get<NotaCombinada>(
    `${API_URL}/api/nota-combinada/?estudiante=${estudianteId}&recurso=${recursoId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return res.data;
}