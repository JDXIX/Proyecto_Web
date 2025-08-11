"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getRecursoDetalle } from "@/services/cursos";

interface Recurso {
  id: string;
  nombre: string;
  tipo: string;
  descripcion?: string;
  archivo_url?: string;
  nivel_nombre?: string;
  leccion_nombre?: string;
}

export default function ResourceViewer({ cursoId }: { cursoId: string }) {
  const searchParams = useSearchParams();
  const recursoId = searchParams.get("recurso");
  const [recurso, setRecurso] = useState<Recurso | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!recursoId) {
      setRecurso(null);
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) return;
    setLoading(true);
    getRecursoDetalle(token, recursoId).then((data) => {
      setRecurso(data);
      setLoading(false);
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
      </div>
    </div>
  );
}