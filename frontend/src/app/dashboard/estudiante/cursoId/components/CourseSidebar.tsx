import React, { useState } from "react";

interface Recurso {
  id: number | string;
  nombre: string;
  tipo: string; // "video", "quiz", "taller", etc.
  esCalificado?: boolean;
  completado?: boolean;
}

interface Leccion {
  id: number | string;
  nombre: string;
  recursos: Recurso[];
}

interface Nivel {
  id: number | string;
  nombre: string;
  lecciones: Leccion[];
}

interface CourseSidebarProps {
  curso: {
    nombre: string;
    icono?: string;
  };
  niveles: Nivel[];
  recursoSeleccionado: { nivelId: string | number; leccionId: string | number; recursoId: string | number } | null;
  onSeleccionarRecurso: (nivelId: string | number, leccionId: string | number, recursoId: string | number) => void;
  onEmpezarRecurso: (recurso: Recurso) => void;
}

export default function CourseSidebar({
  curso,
  niveles,
  recursoSeleccionado,
  onSeleccionarRecurso,
  onEmpezarRecurso,
}: CourseSidebarProps) {
  const [nivelAbierto, setNivelAbierto] = useState<string | number | null>(null);
  const [leccionAbierta, setLeccionAbierta] = useState<string | number | null>(null);

  const handleNivelClick = (nivelId: string | number) => {
    setNivelAbierto(nivelAbierto === nivelId ? null : nivelId);
    setLeccionAbierta(null);
  };

  const handleLeccionClick = (leccionId: string | number) => {
    setLeccionAbierta(leccionAbierta === leccionId ? null : leccionId);
  };

  return (
    <aside className="w-full md:w-80 bg-white border-r border-[#E6F0FA] p-4 overflow-y-auto h-full">
      {/* Icono y nombre del curso */}
      <div className="flex items-center gap-3 mb-6">
        {curso.icono ? (
          <img src={curso.icono} alt={curso.nombre} className="w-12 h-12 rounded-full bg-[#E6F0FA]" />
        ) : (
          <div className="w-12 h-12 rounded-full bg-[#E6F0FA] flex items-center justify-center">
            <svg className="w-8 h-8 text-[#00B7EB]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="#00B7EB" strokeWidth="2" fill="#E6F0FA" />
              <path d="M8 12h8M12 8v8" stroke="#003087" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        )}
        <span className="text-xl font-bold text-[#003087]">{curso.nombre}</span>
      </div>

      {/* Accordion de niveles */}
      <div>
        {niveles.map((nivel) => (
          <div key={nivel.id} className="mb-2">
            <button
              className={`w-full flex justify-between items-center px-3 py-2 rounded font-semibold text-[#003087] bg-[#E6F0FA] hover:bg-[#D3F3FF] transition`}
              onClick={() => handleNivelClick(nivel.id)}
              aria-expanded={nivelAbierto === nivel.id}
            >
              <span>{nivel.nombre}</span>
              <span>{nivelAbierto === nivel.id ? "▲" : "▼"}</span>
            </button>
            {nivelAbierto === nivel.id && (
              <div className="pl-4 mt-1">
                {nivel.lecciones.map((leccion) => (
                  <div key={leccion.id} className="mb-1">
                    <button
                      className={`w-full flex justify-between items-center px-2 py-1 rounded text-[#00B7EB] font-medium hover:bg-[#F4F8FB]`}
                      onClick={() => handleLeccionClick(leccion.id)}
                      aria-expanded={leccionAbierta === leccion.id}
                    >
                      <span>{leccion.nombre}</span>
                      <span>{leccionAbierta === leccion.id ? "▲" : "▼"}</span>
                    </button>
                    {leccionAbierta === leccion.id && (
                      <ul className="pl-4 mt-1 space-y-1">
                        {leccion.recursos.map((recurso) => (
                          <li key={recurso.id} className="flex items-center gap-2">
                            {/* Ícono según tipo de recurso */}
                            <span>
                              {recurso.tipo === "video" && (
                                <svg className="w-5 h-5 text-[#003087]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                  <rect x="3" y="5" width="18" height="14" rx="2" fill="#E6F0FA" stroke="#00B7EB" />
                                  <polygon points="10,9 16,12 10,15" fill="#003087" />
                                </svg>
                              )}
                              {recurso.tipo === "quiz" && (
                                <svg className="w-5 h-5 text-[#003087]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                  <rect x="4" y="4" width="16" height="16" rx="2" fill="#E6F0FA" stroke="#00B7EB" />
                                  <path d="M8 8h8M8 12h6M8 16h4" stroke="#003087" strokeWidth="2" />
                                </svg>
                              )}
                              {recurso.tipo === "taller" && (
                                <svg className="w-5 h-5 text-[#003087]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                  <circle cx="12" cy="12" r="10" fill="#E6F0FA" stroke="#00B7EB" />
                                  <path d="M8 12h8M12 8v8" stroke="#003087" strokeWidth="2" />
                                </svg>
                              )}
                            </span>
                            <button
                              className={`flex-1 text-left px-1 py-1 rounded hover:bg-[#E6F0FA] transition ${
                                recursoSeleccionado &&
                                recursoSeleccionado.nivelId === nivel.id &&
                                recursoSeleccionado.leccionId === leccion.id &&
                                recursoSeleccionado.recursoId === recurso.id
                                  ? "bg-[#D3F3FF] font-bold"
                                  : ""
                              }`}
                              onClick={() => onSeleccionarRecurso(nivel.id, leccion.id, recurso.id)}
                            >
                              {recurso.nombre}
                            </button>
                            {recurso.esCalificado && !recurso.completado && (
                              <button
                                className="ml-2 px-2 py-1 bg-[#00B7EB] text-white rounded text-xs font-semibold hover:bg-[#009fc2] transition"
                                onClick={() => onEmpezarRecurso(recurso)}
                              >
                                Empezar
                              </button>
                            )}
                            {recurso.completado && (
                              <span className="ml-2 text-green-600 text-xs font-semibold">✔</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </aside>
  );
}