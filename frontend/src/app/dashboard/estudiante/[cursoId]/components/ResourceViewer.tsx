"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getRecursoDetalle } from "@/services/cursos";
import { iniciarMonitoreo } from "@/services/monitoreo";

// Función para obtener la sesión de monitoreo del estudiante para este recurso
async function obtenerSesionMonitoreo(recursoId: string, token: string) {
  const res = await fetch(
    `http://localhost:8000/api/sesiones/?recurso=${recursoId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  const data = await res.json();
  // Si data es un array, toma el primer elemento
  if (Array.isArray(data) && data.length > 0) {
    return data[0].id;
  }
  // Si data tiene results (por si cambias el backend), también lo soporta
  if (data.results && data.results.length > 0) {
    return data.results[0].id;
  }
  return null;
}
interface Recurso {
  id: string;
  nombre: string;
  tipo: string;
  descripcion?: string;
  archivo_url?: string;
  nivel_nombre?: string;
  leccion_nombre?: string;
  permite_monitoreo?: boolean;
  es_evaluable?: boolean;
  duracion?: number; // <-- AGREGA ESTE CAMPO
}

export default function ResourceViewer({ cursoId }: { cursoId: string }) {
  const searchParams = useSearchParams();
  const recursoId = searchParams.get("recurso");
  const [recurso, setRecurso] = useState<Recurso | null>(null);
  const [loading, setLoading] = useState(false);

  // Estado para monitoreo
  const [monitoreoLoading, setMonitoreoLoading] = useState(false);
  const [monitoreoResultado, setMonitoreoResultado] = useState<any>(null);

  // Estado para sesionId (automático)
  const [sesionId, setSesionId] = useState<string | null>(null);

  // Estado para consentimiento
  const [mostrarConsentimiento, setMostrarConsentimiento] = useState(false);

  useEffect(() => {
    if (!recursoId) {
      setRecurso(null);
      setSesionId(null);
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) return;
    setLoading(true);
    getRecursoDetalle(token, recursoId).then((data) => {
      setRecurso(data);
      setLoading(false);
    });
    setMonitoreoResultado(null);
    setMonitoreoLoading(false);

    // Obtener la sesión de monitoreo para este recurso y estudiante
    obtenerSesionMonitoreo(recursoId, token).then((id) => {
      console.log("SesionId obtenido:", id); // <-- Depuración
      setSesionId(id);
    });
  }, [recursoId]);

  if (!recursoId) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        Selecciona un recurso para comenzar.
      </div>
    );
  }

  if (loading || !recurso) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        Cargando recurso...
      </div>
    );
  }

  // Estilos base para todos los recursos
  const recursoStyle = {
    width: "100%",
    maxWidth: "1000px",
    height: "500px",
    objectFit: "contain" as const,
    background: "black",
  };

  // Mostrar botón solo si permite monitoreo y es evaluable
  const mostrarBotonEmpezar = recurso.permite_monitoreo && recurso.es_evaluable;

  // Paso 1: Mostrar consentimiento antes de monitorear
  const handleEmpezar = () => {
    console.log("Clic en Empezar, sesionId:", sesionId); // <-- Depuración
    setMonitoreoResultado(null);
    setMonitoreoLoading(false);
    setMostrarConsentimiento(true);
  };

  // Paso 2: Si acepta, iniciar monitoreo
  const handleAceptarConsentimiento = async () => {
    setMostrarConsentimiento(false);
    setMonitoreoLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!sesionId || !token) throw new Error("Sesión o token no disponible");
      // ENVÍA LA DURACIÓN DEL RECURSO
      const res = await iniciarMonitoreo(sesionId, 85, token, recurso?.duracion);
      setMonitoreoResultado(res.patrones);
    } catch (e: any) {
      setMonitoreoResultado({ error: e.message || "Error al monitorear atención" });
    }
    setMonitoreoLoading(false);
  };

  // Si cancela, solo cierra el modal
  const handleCancelarConsentimiento = () => {
    setMostrarConsentimiento(false);
  };

  return (
    <div className="flex justify-center mt-8">
      <div className="bg-white rounded-xl shadow p-8 w-full max-w-4xl">
        {/* Breadcrumbs */}
        <div className="text-sm text-gray-500 mb-2">
          {recurso.nivel_nombre && <span>{recurso.nivel_nombre} / </span>}
          {recurso.leccion_nombre && <span>{recurso.leccion_nombre} / </span>}
          <span>{recurso.nombre}</span>
        </div>
        {/* Título */}
        <h2 className="text-2xl font-bold text-[#003087] mb-4">{recurso.nombre}</h2>
        {/* Área de recurso */}
        <div className="flex justify-center mb-4">
          {/* Video */}
          {recurso.tipo === "video" && recurso.archivo_url && (
            <video
              src={recurso.archivo_url}
              controls
              className="rounded-lg bg-black"
              style={recursoStyle}
            />
          )}
          {/* PDF */}
          {recurso.tipo === "pdf" && recurso.archivo_url && (
            <iframe
              src={recurso.archivo_url}
              className="rounded-lg bg-black"
              style={recursoStyle}
              title={recurso.nombre}
            />
          )}
          {/* Otros tipos de recurso */}
          {recurso.tipo === "archivo" && recurso.archivo_url && (
            <div className="flex flex-col items-center w-full">
              <a
                href={recurso.archivo_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#003087] underline font-semibold"
                style={{ ...recursoStyle, display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                Descargar archivo
              </a>
            </div>
          )}
          {/* Quiz, simulador, etc. pueden agregarse aquí */}
          {recurso.tipo === "quiz" && (
            <div
              className="rounded-lg bg-black flex items-center justify-center text-white text-xl"
              style={recursoStyle}
            >
              Quiz interactivo (próximamente)
            </div>
          )}
          {recurso.tipo === "simulador" && recurso.archivo_url && (
            <iframe
              src={recurso.archivo_url}
              className="rounded-lg bg-black"
              style={recursoStyle}
              title={recurso.nombre}
            />
          )}
        </div>
        {/* Descripción */}
        {recurso.descripcion && (
          <div className="text-gray-700">{recurso.descripcion}</div>
        )}

        {/* Botón Empezar y feedback monitoreo */}
        {mostrarBotonEmpezar && (
          <div className="mt-6">
            <button
              className="bg-blue-700 text-white px-5 py-2 rounded hover:bg-blue-800 transition"
              onClick={handleEmpezar}
              disabled={monitoreoLoading || !sesionId}
            >
              {monitoreoLoading ? "Monitoreando..." : "Empezar"}
            </button>
            {/* Modal de consentimiento */}
            {mostrarConsentimiento && (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
                <div className="bg-white p-6 rounded shadow-lg max-w-md w-full">
                  <h3 className="text-lg font-bold mb-2 text-[#003087]">
                    Consentimiento para Monitoreo
                  </h3>
                  <p className="mb-4">
                    ¿Acepta que se realice el monitoreo de atención durante el uso de este recurso?
                    <br />
                    <span className="text-xs text-gray-500">
                      (Conforme a la norma ISO 21001:2018)
                    </span>
                  </p>
                  <div className="flex justify-end gap-2">
                    <button
                      className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                      onClick={handleCancelarConsentimiento}
                    >
                      Cancelar
                    </button>
                    <button
                      className="px-4 py-2 rounded bg-blue-700 text-white hover:bg-blue-800"
                      onClick={handleAceptarConsentimiento}
                    >
                      Aceptar
                    </button>
                  </div>
                </div>
              </div>
            )}
            {/* Resultado monitoreo */}
            {monitoreoResultado && (
              <div className="mt-4 bg-gray-100 p-3 rounded text-sm">
                {monitoreoResultado.error ? (
                  <span className="text-red-600">{monitoreoResultado.error}</span>
                ) : (
                  <pre className="overflow-x-auto">{JSON.stringify(monitoreoResultado, null, 2)}</pre>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}