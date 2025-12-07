"use client";

import type { NotaCombinada } from "@/services/monitoreo";
import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { getRecursoDetalle } from "@/services/cursos";
import {
  iniciarMonitoreo,
  obtenerNotaCombinada,
  crearSesionParaMi,
  enviarFrame,
} from "@/services/monitoreo";
import RecomendacionIA from "./RecomendacionIA";

async function obtenerSesionMonitoreo(recursoId: string, token: string) {
  const res = await fetch(
    `http://localhost:8000/api/sesiones/?recurso=${recursoId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  const data = await res.json();

  if (Array.isArray(data) && data.length > 0) return data[0].id;
  if (data.results && data.results.length > 0) return data.results[0].id;

  // Si no hay sesión existente, crearla para el estudiante autenticado
  try {
    const creada = await crearSesionParaMi(recursoId, token);
    return creada?.id || null;
  } catch {
    return null;
  }
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
  leccion_id?: string; // por compatibilidad
  fase_id?: string; // por compatibilidad
}

export default function ResourceViewer({ cursoId }: { cursoId: string }) {
  const searchParams = useSearchParams();
  const recursoId = searchParams.get("recurso");

  const [recurso, setRecurso] = useState<Recurso | null>(null);
  const [loading, setLoading] = useState(false);

  const [monitoreoEnCurso, setMonitoreoEnCurso] = useState(false);
  const [monitoreoResultado, setMonitoreoResultado] = useState<any>(null);
  const [sesionId, setSesionId] = useState<string | null>(null);
  const [mostrarConsentimiento, setMostrarConsentimiento] = useState(false);
  const [tiempoRestante, setTiempoRestante] = useState<number | null>(null);

  const [notaCombinada, setNotaCombinada] = useState<{
    score_atencion: number;
    nota_academica: number;
    nota_combinada: number;
  } | null>(null);

  // timers
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // cámara
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const frameIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const estudianteId =
    typeof window !== "undefined" ? localStorage.getItem("user_id") : null;

  // =========================================================
  //  Cargar detalle del recurso y sesión de monitoreo
  // =========================================================
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
    obtenerSesionMonitoreo(recursoId, token).then((id) => setSesionId(id));
    setNotaCombinada(null);
  }, [recursoId]);

  // Cleanup global al desmontar
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      detenerCamara();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // =========================================================
  //  Nota combinada (solo si es evaluable)
  // =========================================================
  useEffect(() => {
    if (!recursoId || !estudianteId) return;

    if (!recurso?.es_evaluable) {
      setNotaCombinada(null);
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) return;

    obtenerNotaCombinada(estudianteId, recursoId, token)
      .then((data: NotaCombinada) =>
        setNotaCombinada({
          score_atencion: data.score_atencion ?? 0,
          nota_academica: data.nota_academica ?? 0,
          nota_combinada: data.nota_combinada,
        })
      )
      .catch(() => setNotaCombinada(null));
  }, [recursoId, estudianteId, recurso?.es_evaluable, monitoreoResultado]);

  // =========================================================
  //  Cámara: pedir stream (desde el click) y luego conectarlo
  // =========================================================

  // 1) Pedir stream: se llama SOLO desde el click (gesto del usuario)
  const iniciarCamara = async () => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices) {
      throw new Error("El navegador no soporta acceso a la cámara.");
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false,
    });

    streamRef.current = stream;
  };

  // 2) Cuando el monitoreo está en curso, conectar el stream al <video>
  useEffect(() => {
    if (!monitoreoEnCurso) return;

    const video = videoRef.current;
    const stream = streamRef.current;
    if (!video || !stream) return;

    video.srcObject = stream;

    const onLoaded = () => {
      video
        .play()
        .then(() => {
          console.log(
            "📸 Cámara lista. Tamaño:",
            video.videoWidth,
            video.videoHeight
          );
        })
        .catch((err) => {
          console.error("Error al reproducir el video de la cámara:", err);
        });
    };

    if (video.readyState >= 2) {
      onLoaded();
    } else {
      video.onloadedmetadata = onLoaded;
    }
  }, [monitoreoEnCurso]);

  const detenerCamara = () => {
    if (frameIntervalRef.current) {
      clearInterval(frameIntervalRef.current);
      frameIntervalRef.current = null;
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const capturarYEnviarFrame = async (sesion: string, token: string) => {
    const video = videoRef.current;
    if (!video) return;

    if (video.videoWidth === 0 || video.videoHeight === 0) {
      console.warn("⚠️ Video sin dimensiones aún. Frame omitido.");
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const frame = canvas.toDataURL("image/jpeg");

    try {
      await enviarFrame({ sesionId: sesion, frame });
    } catch (err) {
      console.error("Error enviando frame:", err);
    }
  };

  // =========================================================
  //  UI / Lógica de botones
  // =========================================================

  if (!recursoId) {
    return (
      <div className="flex-1 flex items-center justify-center text-[var(--color-text-light)]">
        Selecciona un recurso para comenzar.
      </div>
    );
  }

  if (loading || !recurso) {
    return (
      <div className="flex-1 flex items-center justify-center text-[var(--color-text-light)]">
        Cargando recurso...
      </div>
    );
  }

  const mostrarBotonEmpezar = !!recurso.permite_monitoreo;

  const handleEmpezar = () => {
    setMonitoreoResultado(null);
    setMostrarConsentimiento(true);
  };

  const handleAceptarConsentimiento = async () => {
    setMostrarConsentimiento(false);

    const token = localStorage.getItem("token");
    if (!sesionId || !token) {
      setMonitoreoResultado({
        error: "No se pudo iniciar el monitoreo (sesión o token no disponible).",
      });
      return;
    }

    try {
      // 1) Pedimos el stream (gesto directo del usuario)
      await iniciarCamara();

      // 2) Activamos monitoreo (aparece recurso + cámara)
      setMonitoreoEnCurso(true);
      const duracion = recurso?.duracion || 30;
      setTiempoRestante(duracion);

      // 3) Cuenta regresiva
      timerRef.current = setInterval(() => {
        setTiempoRestante((prev) => {
          if (!prev) return prev;
          if (prev > 1) return prev - 1;

          detenerCamara();
          setMonitoreoEnCurso(false);
          return 0;
        });
      }, 1000);

      // 4) Enviar frames periódicamente
      frameIntervalRef.current = setInterval(() => {
        capturarYEnviarFrame(sesionId, token);
      }, 1000);

      // 5) Avisar al backend (inicio monitoreo)
      const res = await iniciarMonitoreo(sesionId, token, duracion);
      setMonitoreoResultado(res || { mensaje: "Monitoreo finalizado." });
    } catch (e: any) {
      console.error(e);
      detenerCamara();
      setMonitoreoEnCurso(false);
      setMonitoreoResultado({
        error:
          e?.message ||
          "Ocurrió un error al iniciar el monitoreo o al acceder a la cámara.",
      });
    }
  };

  const handleCancelarConsentimiento = () => {
    setMostrarConsentimiento(false);
  };

  const renderRecurso = () => {
    const recursoStyle = {
      width: "100%",
      maxWidth: "1000px",
      height: "480px",
      objectFit: "contain" as const,
      background: "black",
      pointerEvents: "none" as const,
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
          onContextMenu={(e) => e.preventDefault()}
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
    return (
      <div
        className="rounded-lg bg-black flex items-center justify-center text-white text-xl"
        style={recursoStyle}
      >
        Recurso no soportado
      </div>
    );
  };

  // =========================================================
  //  UI principal (diseño nuevo)
  // =========================================================

  return (
    <section className="flex-1 flex items-start justify-center px-4 md:px-8 mt-6">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-sm border border-[var(--color-border)] p-6 md:p-8 space-y-6">
        {/* Breadcrumbs */}
        <div className="text-xs font-medium text-[var(--color-text-light)] tracking-wide uppercase">
          {recurso.nivel_nombre && <span>{recurso.nivel_nombre} / </span>}
          {recurso.leccion_nombre && <span>{recurso.leccion_nombre} / </span>}
          <span className="normal-case font-normal text-[var(--color-text-light)]">
            {recurso.nombre}
          </span>
        </div>

        {/* Título y descripción */}
        <div className="space-y-2">
          <h2 className="text-2xl md:text-3xl font-bold text-[var(--color-primary)]">
            {recurso.nombre}
          </h2>
          {recurso.descripcion && (
            <p className="text-sm md:text-base text-[var(--color-text-light)]">
              {recurso.descripcion}
            </p>
          )}

          {/* Tags */}
          <div className="flex flex-wrap gap-2 pt-1">
            <span className="px-3 py-1 rounded-full bg-[var(--color-bg)] text-[var(--color-primary)] text-xs font-medium">
              {recurso.tipo || "Recurso"}
            </span>
            {recurso.es_evaluable && (
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium">
                Evaluable
              </span>
            )}
            {recurso.permite_monitoreo && (
              <span className="px-3 py-1 rounded-full bg-violet-50 text-violet-700 text-xs font-medium">
                Monitoreo de atención activo
              </span>
            )}
          </div>
        </div>

        {/* Estado inicial: solo botón Empezar */}
        {mostrarBotonEmpezar && !monitoreoEnCurso && !monitoreoResultado && (
          <div className="pt-2">
            <button
              className="px-6 py-2.5 rounded-lg bg-[var(--color-primary)] text-white font-semibold 
                         text-sm md:text-base hover:bg-blue-600 focus:outline-none 
                         focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-1 transition"
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
            <div className="bg-white p-6 rounded-2xl shadow-lg max-w-md w-full border border-[var(--color-border)]">
              <h3 className="text-lg font-bold mb-2 text-[var(--color-primary)]">
                Consentimiento para monitoreo
              </h3>
              <p className="mb-4 text-sm text-[var(--color-text)]">
                ¿Aceptas que se realice el monitoreo de tu nivel de atención
                mientras utilizas este recurso?
                <br />
                <span className="text-xs text-[var(--color-text-light)]">
                  El monitoreo se inicia inmediatamente después de aceptar.
                </span>
              </p>
              <div className="flex justify-end gap-2">
                <button
                  className="px-4 py-2 rounded-lg bg-gray-100 text-[var(--color-text)] hover:bg-gray-200 text-sm font-medium"
                  onClick={handleCancelarConsentimiento}
                >
                  Cancelar
                </button>
                <button
                  className="px-4 py-2 rounded-lg bg-[var(--color-primary)] text-white hover:bg-blue-600 text-sm font-semibold"
                  onClick={handleAceptarConsentimiento}
                >
                  Aceptar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Monitoreo en curso */}
        {monitoreoEnCurso && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="font-medium text-[var(--color-primary)]">
                Monitoreo en curso…
              </p>
              <span className="text-sm text-[var(--color-text-light)]">
                Tiempo restante:{" "}
                <span className="font-semibold text-[var(--color-text)]">
                  {tiempoRestante}s
                </span>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-4">
              {/* Recurso principal */}
              <div className="flex justify-center">{renderRecurso()}</div>

              {/* Vista previa de cámara */}
              <div className="bg-[var(--color-bg)] rounded-xl border border-[var(--color-border)] p-4 flex flex-col items-center gap-3">
                <p className="text-sm font-medium text-[var(--color-text-light)]">
                  Vista previa de tu cámara
                </p>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full rounded-lg border border-[var(--color-border)] shadow-sm bg-black"
                />
                <p className="text-xs text-[var(--color-text-light)] text-center">
                  Mantén tu rostro visible y mira hacia la pantalla durante la
                  evaluación.
                </p>
              </div>
            </div>

            <div className="text-xs text-center text-[var(--color-text-light)]">
              No cierres la pestaña hasta que termine el monitoreo.
            </div>
          </div>
        )}

        {/* Resultado monitoreo */}
        {monitoreoResultado && !monitoreoEnCurso && (
          <div className="mt-2 text-center">
            {monitoreoResultado.error ? (
              <span className="text-red-600 text-sm font-medium">
                {monitoreoResultado.error}
              </span>
            ) : (
              <span className="text-emerald-700 font-semibold text-sm">
                Monitoreo finalizado. ¡Gracias por tu participación!
              </span>
            )}
          </div>
        )}

        {/* Nota combinada */}
        {recurso.es_evaluable && notaCombinada !== null && (
          <div className="mt-4 flex flex-col items-center gap-1">
            <div className="text-sm text-[var(--color-text-light)]">
              Nota combinada del recurso
            </div>
            <div className="text-2xl font-bold text-[var(--color-primary)]">
              {notaCombinada.nota_combinada}
            </div>
          </div>
        )}

        {/* Recomendación IA */}
        {recurso.es_evaluable && estudianteId && recursoId && (
          <div className="mt-4">
            <RecomendacionIA
              estudianteId={estudianteId}
              faseId={recurso.leccion_id || recurso.fase_id || ""}
              atencion={notaCombinada?.score_atencion || 0}
              nota={notaCombinada?.nota_academica || 0}
            />
          </div>
        )}
      </div>
    </section>
  );
}
