import axios from "axios";
import type { SesionMonitoreo } from "../types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/* -----------------------------------------------------
   TIPOS YA EXISTENTES
----------------------------------------------------- */

interface MonitoreoResponse {
  sesion: SesionMonitoreo;
  atencion_visual?: {
    score_atencion: number;
    patrones: Record<string, unknown>;
  };
  mensaje?: string;
}

export interface NotaCombinada {
  estudiante: string;
  recurso: string;
  score_atencion?: number;
  nota_academica?: number;
  nota_combinada: number;
}

/* -----------------------------------------------------
   ⚡️ NUEVO TIPO PARA RESPUESTA FRAME A FRAME
----------------------------------------------------- */

export interface RespuestaMonitoreo {
  estado_atencion?: "ALTA" | "MEDIA" | "BAJA";
  score_atencion?: number;
  ear?: number;
  mar?: number;
  yaw?: number;
  pitch?: number;
  roll?: number;
  [key: string]: unknown;
}

/* -----------------------------------------------------
   INICIAR MONITOREO (SE MANTIENE IGUAL)
----------------------------------------------------- */

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

/* -----------------------------------------------------
   CREAR SESIONES MULTIPLES (SE MANTIENE)
----------------------------------------------------- */

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

/* -----------------------------------------------------
   CREAR SESIÓN PARA UN ESTUDIANTE (SE MANTIENE)
----------------------------------------------------- */

export async function crearSesionParaMi(
  recursoId: string,
  token: string
): Promise<{ id: string }> {
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
  return res.data;
}

/* -----------------------------------------------------
   OBTENER NOTA COMBINADA (SE MANTIENE)
----------------------------------------------------- */

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

/* -----------------------------------------------------
   🔥 NUEVO — ENVÍO DE FRAME BASE64 AL BACKEND
----------------------------------------------------- */

interface EnviarFrameParams {
  sesionId: string;
  frame: string; // dataURL completa "data:image/jpeg;base64,XXXXX"
}

export async function enviarFrame(
  { sesionId, frame }: EnviarFrameParams
): Promise<RespuestaMonitoreo> {
  
  const token =
    typeof window !== "undefined"
      ? window.localStorage.getItem("token") // ✔ usa el token correcto del sistema
      : null;

  const url = `${API_URL}/api/sesiones/${sesionId}/monitoreo-atencion/`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      frame, // ✔ enviamos el frame completo
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Error ${res.status} al enviar frame: ${text}`);
  }

  return (await res.json()) as RespuestaMonitoreo;
}
