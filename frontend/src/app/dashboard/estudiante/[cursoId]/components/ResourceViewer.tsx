"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getRecursoDetalle } from "@/services/cursos"; // Debes tener este servicio

export default function ResourceViewer({ cursoId }: { cursoId: string }) {
  const searchParams = useSearchParams();
  const recursoId = searchParams.get("recurso");
  const [recurso, setRecurso] = useState<any>(null);

  useEffect(() => {
    if (recursoId) {
      const token = localStorage.getItem("token");
      if (token) {
        getRecursoDetalle(token, recursoId).then(setRecurso);
      }
    }
  }, [recursoId]);

  if (!recursoId) {
    return <div className="text-gray-500">Selecciona un recurso para comenzar.</div>;
  }

  if (!recurso) {
    return <div className="text-gray-500">Cargando recurso...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* Breadcrumbs */}
      <div className="text-sm text-gray-500 mb-2">
        {recurso.nivel_nombre} / {recurso.leccion_nombre} / {recurso.nombre}
      </div>
      {/* Título */}
      <h2 className="text-2xl font-bold text-[#003087] mb-4">{recurso.nombre}</h2>
      {/* Contenido dinámico */}
      {recurso.tipo === "video" && (
        <video controls className="w-full rounded mb-4" src={recurso.archivo_url} />
      )}
      {recurso.tipo === "pdf" && (
        <iframe src={recurso.archivo_url} className="w-full h-96 rounded mb-4" />
      )}
      {recurso.tipo === "quiz" && (
        <div className="mb-4">[Aquí va el componente de quiz]</div>
      )}
      {/* ...otros tipos */}
      {/* Descripción */}
      <div className="text-gray-700">{recurso.descripcion}</div>
    </div>
  );
}