"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { getRecursoDetalle } from "@/services/cursos";
import { iniciarMonitoreo } from "@/services/monitoreo";

async function obtenerSesionMonitoreo(recursoId: string, token: string) {
  const res = await fetch(
    `http://localhost:8000/api/sesiones/?recurso=${recursoId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  const data = await res.json();
  if (Array.isArray(data) && data.length > 0) {
    return data[0].id;
  }
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
  duracion?: number;
}

export default function ResourceViewer({ cursoId }: { cursoId: string }) {
  const searchParams = useSearchParams();
  const recursoId = searchParams.get("recurso");
  const [recurso, setRecurso] = useState<Recurso | null>(null);
  const [loading, setLoading] = useState(false);

  // Monitoreo y control de recurso
  const [monitoreoEnCurso, setMonitoreoEnCurso] = useState(false);
  const [monitoreoResultado, setMonitoreoResultado] = useState<any>(null);
  const [sesionId, setSesionId] = useState<string | null>(null);
  const [mostrarConsentimiento, setMostrarConsentimiento] = useState(false);
  const [tiempoRestante, setTiempoRestante] = useState<number | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

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
    setMonitoreoEnCurso(false);

    obtenerSesionMonitoreo(recursoId, token).then((id) => {
      setSesionId(id);
    });
  }, [recursoId]);

  useEffect(() => {
    // Limpia el timer si el componente se desmonta
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

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

  const mostrarBotonEmpezar = recurso.permite_monitoreo && recurso.es_evaluable;

  // Paso 1: Mostrar consentimiento antes de monitorear
  const handleEmpezar = () => {
    setMonitoreoResultado(null);
    setMostrarConsentimiento(true);
  };

  // Paso 2: Si acepta, iniciar monitoreo y mostrar recurso
  const handleAceptarConsentimiento = async () => {
    setMostrarConsentimiento(false);
    setMonitoreoEnCurso(true);
    setTiempoRestante(recurso?.duracion || 30);

    // Inicia monitoreo en paralelo
    try {
      const token = localStorage.getItem("token");
      if (!sesionId || !token) throw new Error("Sesión o token no disponible");
      const monitoreoPromise = iniciarMonitoreo(sesionId, 85, token, recurso?.duracion);

      // Timer para controlar la duración del recurso
      timerRef.current = setInterval(() => {
        setTiempoRestante((prev) => {
          if (prev && prev > 1) return prev - 1;
          if (timerRef.current) clearInterval(timerRef.current);
          setMonitoreoEnCurso(false);
          return 0;
        });
      }, 1000);

      // Espera el resultado del monitoreo
      const res = await monitoreoPromise;
      setMonitoreoResultado(res?.mensaje || "Monitoreo finalizado.");
    } catch (e: any) {
      setMonitoreoResultado({ error: e.message || "Error al monitorear atención" });
    }
  };

  // Si cancela, solo cierra el modal
  const handleCancelarConsentimiento = () => {
    setMostrarConsentimiento(false);
  };

  // Renderiza el recurso solo durante el monitoreo
  const renderRecurso = () => {
    const recursoStyle = {
      width: "100%",
      maxWidth: "1000px",
      height: "500px",
      objectFit: "contain" as const,
      background: "black",
      pointerEvents: "none" as const, // Evita interacción
      userSelect: "none" as const,
    };

    if (recurso.tipo === "video" && recurso.archivo_url) {
      return (
        <video
          src={recurso.archivo_url}
          autoPlay
          controls={false}
          style={recursoStyle}
          tabIndex={-1}
          onContextMenu={e => e.preventDefault()}
        />
      );
    }
    if (recurso.tipo === "pdf" && recurso.archivo_url) {
      return (
        <iframe
          src={recurso.archivo_url}
          style={recursoStyle}
          title={recurso.nombre}
          tabIndex={-1}
        />
      );
    }
    if (recurso.tipo === "quiz" || recurso.tipo === "simulador") {
      return (
        <div
          className="rounded-lg bg-black flex items-center justify-center text-white text-xl"
          style={recursoStyle}
        >
          {recurso.tipo === "quiz" ? "Quiz interactivo" : "Simulador"}
        </div>
      );
    }
    // Otros tipos pueden agregarse aquí
    return (
      <div
        className="rounded-lg bg-black flex items-center justify-center text-white text-xl"
        style={recursoStyle}
      >
        Recurso no soportado
      </div>
    );
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
        {/* Descripción */}
        {recurso.descripcion && (
          <div className="text-gray-700 mb-4">{recurso.descripcion}</div>
        )}

        {/* Botón Empezar */}
        {mostrarBotonEmpezar && !monitoreoEnCurso && !monitoreoResultado && (
          <div className="mt-6">
            <button
              className="bg-blue-700 text-white px-5 py-2 rounded hover:bg-blue-800 transition"
              onClick={handleEmpezar}
              disabled={!sesionId}
            >
              Empezar
            </button>
          </div>
        )}

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

        {/* Recurso y monitoreo en curso */}
        {monitoreoEnCurso && (
          <div className="mt-6">
            <div className="mb-2 text-center font-semibold text-[#003087]">
              Monitoreo en curso... Tiempo restante: {tiempoRestante}s
            </div>
            <div>{renderRecurso()}</div>
            <div className="mt-4 text-center text-gray-500">
              Por favor, permanece en la plataforma hasta que termine el monitoreo.
            </div>
          </div>
        )}

        {/* Resultado monitoreo */}
        {monitoreoResultado && (
          <div className="mt-6 text-center">
            {monitoreoResultado.error ? (
              <span className="text-red-600">{monitoreoResultado.error}</span>
            ) : (
              <span className="text-green-700 font-semibold">
                Monitoreo finalizado. ¡Gracias por tu participación!
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}