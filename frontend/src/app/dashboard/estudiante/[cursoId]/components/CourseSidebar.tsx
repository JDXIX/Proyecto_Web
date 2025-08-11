"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FiChevronDown, FiChevronRight, FiBookOpen, FiFileText, FiPlayCircle, FiFile } from "react-icons/fi";
import { getCursoDetalle } from "@/services/cursos"; // Debes tener este servicio

function getIcon(tipo: string) {
  switch (tipo) {
    case "video": return <FiPlayCircle />;
    case "quiz": return <FiFileText />;
    case "pdf": return <FiFile />;
    default: return <FiBookOpen />;
  }
}

export default function CourseSidebar({ cursoId }: { cursoId: string }) {
  const [curso, setCurso] = useState<any>(null);
  const [openNivel, setOpenNivel] = useState<string | null>(null);
  const [openLeccion, setOpenLeccion] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      getCursoDetalle(token, cursoId).then(setCurso);
    }
  }, [cursoId]);

  if (!curso) {
    return (
      <aside className="w-72 bg-white border-r p-4">
        <div className="font-bold text-[#003087] mb-4">Cargando...</div>
      </aside>
    );
  }

  return (
    <aside className="w-72 bg-white border-r border-[#E6F0FA] p-4 flex flex-col">
      {/* Icono y nombre del curso */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-[#E6F0FA] flex items-center justify-center shadow">
          <span className="text-2xl text-[#00B7EB]">📘</span>
        </div>
        <div className="font-bold text-lg text-[#003087]">{curso.nombre}</div>
      </div>
      {/* Niveles */}
      <nav className="flex-1">
        {curso.niveles?.map((nivel: any) => (
          <div key={nivel.id} className="mb-2">
            <button
              className="flex items-center w-full text-left px-2 py-2 rounded hover:bg-[#e6f0fa] font-semibold text-[#003087] transition"
              onClick={() => setOpenNivel(openNivel === nivel.id ? null : nivel.id)}
            >
              {openNivel === nivel.id ? <FiChevronDown /> : <FiChevronRight />}
              <span className="ml-2">{nivel.nombre}</span>
            </button>
            {/* Lecciones */}
            {openNivel === nivel.id && (
              <div className="ml-6">
                {nivel.lecciones?.map((leccion: any) => (
                  <div key={leccion.id} className="mb-1">
                    <button
                      className="flex items-center w-full text-left px-2 py-1 rounded hover:bg-[#f4f8fb] font-medium text-[#003087] transition"
                      onClick={() => setOpenLeccion(openLeccion === leccion.id ? null : leccion.id)}
                    >
                      {openLeccion === leccion.id ? <FiChevronDown /> : <FiChevronRight />}
                      <span className="ml-2">{leccion.nombre}</span>
                    </button>
                    {/* Recursos */}
                    {openLeccion === leccion.id && (
                      <div className="ml-6">
                        {leccion.recursos?.map((recurso: any) => (
                          <Link
                            key={recurso.id}
                            href={`/dashboard/estudiante/${cursoId}?recurso=${recurso.id}`}
                            className="flex items-center gap-2 px-2 py-1 rounded hover:bg-[#e6f0fa] text-[#003087] text-sm"
                          >
                            {getIcon(recurso.tipo)}
                            <span>{recurso.nombre}</span>
                            {recurso.es_evaluable && (
                              <span className="ml-auto bg-[#00B7EB] text-white text-xs px-2 py-0.5 rounded">Empezar</span>
                            )}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
}