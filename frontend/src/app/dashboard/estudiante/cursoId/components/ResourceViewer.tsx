import React from "react";

interface Recurso {
  id: number | string;
  nombre: string;
  tipo: string; // "video", "quiz", "taller", etc.
  url?: string;
  descripcion?: string;
  esCalificado?: boolean;
  completado?: boolean;
  haEmpezado?: boolean;
}

interface Breadcrumb {
  nivel: string;
  leccion: string;
  recurso: string;
}

interface ResourceViewerProps {
  recurso: Recurso | null;
  breadcrumb: Breadcrumb | null;
  onAnterior: () => void;
  onSiguiente: () => void;
  puedeNavegar: boolean;
}

export default function ResourceViewer({
  recurso,
  breadcrumb,
  onAnterior,
  onSiguiente,
  puedeNavegar,
}: ResourceViewerProps) {
  if (!recurso) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500">
        <span className="text-lg">Selecciona un recurso para comenzar</span>
      </div>
    );
  }

  // Renderiza el recurso según su tipo
  const renderRecurso = () => {
    switch (recurso.tipo) {
      case "video":
        return recurso.url ? (
          <video
            src={recurso.url}
            controls
            className="w-full max-h-[400px] rounded shadow mb-4 bg-black"
          />
        ) : (
          <div className="text-center text-gray-400">Video no disponible</div>
        );
      case "quiz":
        return (
          <div className="bg-[#E6F0FA] p-6 rounded shadow mb-4 text-center text-[#003087]">
            <span>Quiz interactivo aquí (pendiente de integración)</span>
          </div>
        );
      case "taller":
        return (
          <div className="bg-[#E6F0FA] p-6 rounded shadow mb-4 text-center text-[#003087]">
            <span>Taller/actividad aquí (pendiente de integración)</span>
          </div>
        );
      default:
        return (
          <div className="bg-[#E6F0FA] p-6 rounded shadow mb-4 text-center text-[#003087]">
            <span>Recurso no soportado</span>
          </div>
        );
    }
  };

  return (
    <section className="w-full h-full flex flex-col items-center">
      {/* Controles de navegación */}
      <div className="flex w-full justify-between items-center mb-4">
        <button
          onClick={onAnterior}
          disabled={!puedeNavegar}
          className={`px-4 py-2 rounded bg-[#003087] text-white font-semibold shadow hover:bg-[#0050b3] transition disabled:bg-gray-300 disabled:text-gray-400`}
        >
          ← Anterior
        </button>
        <button
          onClick={onSiguiente}
          disabled={!puedeNavegar}
          className={`px-4 py-2 rounded bg-[#003087] text-white font-semibold shadow hover:bg-[#0050b3] transition disabled:bg-gray-300 disabled:text-gray-400`}
        >
          Siguiente →
        </button>
      </div>

      {/* Recurso */}
      <div className="w-full flex flex-col items-center">{renderRecurso()}</div>

      {/* Breadcrumbs y título */}
      {breadcrumb && (
        <div className="w-full mt-2 mb-1 text-sm text-[#003087]">
          {breadcrumb.nivel} / {breadcrumb.leccion} / {breadcrumb.recurso}
        </div>
      )}
      <h2 className="text-2xl font-bold text-[#003087] mb-2">{recurso.nombre}</h2>

      {/* Descripción */}
      {recurso.descripcion && (
        <div className="w-full bg-white rounded p-4 shadow text-gray-700">
          {recurso.descripcion}
        </div>
      )}
    </section>
  );
}