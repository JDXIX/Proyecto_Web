"use client";

import { useEffect, useState } from "react";
import { getNiveles, getLecciones, getRecursos } from "@/services/cursos";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  FaRegLightbulb,
  FaRegFileVideo,
  FaRegFilePdf,
  FaRegFileAlt,
  FaRegCheckCircle,
} from "react-icons/fa";

interface Nivel {
  id: string;
  nombre: string;
  orden: number;
}

interface Leccion {
  id: string;
  nombre: string;
  nivel: string;
}

interface Recurso {
  id: string;
  nombre: string;
  tipo: string;
  es_evaluable?: boolean;
  permite_monitoreo?: boolean;
}

function getRecursoIcon(tipo: string) {
  switch (tipo) {
    case "video":
      return <FaRegFileVideo className="inline mr-1 text-[var(--color-primary)]" />;
    case "pdf":
      return <FaRegFilePdf className="inline mr-1 text-red-400" />;
    case "quiz":
      return <FaRegLightbulb className="inline mr-1 text-amber-400" />;
    case "simulador":
      return <FaRegLightbulb className="inline mr-1 text-emerald-400" />;
    default:
      return <FaRegFileAlt className="inline mr-1 text-gray-400" />;
  }
}

export default function CourseSidebar({ cursoId }: { cursoId: string }) {
  const [niveles, setNiveles] = useState<Nivel[]>([]);
  const [expandedNiveles, setExpandedNiveles] = useState<string[]>([]);
  const [lecciones, setLecciones] = useState<{ [nivelId: string]: Leccion[] }>({});
  const [expandedLecciones, setExpandedLecciones] = useState<string[]>([]);
  const [recursos, setRecursos] = useState<{ [leccionId: string]: Recurso[] }>({});
  const [loading, setLoading] = useState(true);

  const searchParams = useSearchParams();
  const router = useRouter();
  const recursoActivo = searchParams.get("recurso");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setLoading(true);
    getNiveles(cursoId, token).then((nivelesData) => {
      setNiveles(nivelesData);
      setLoading(false);
    });
  }, [cursoId]);

  const handleExpandNivel = (nivelId: string) => {
    setExpandedNiveles((prev) =>
      prev.includes(nivelId) ? prev.filter((id) => id !== nivelId) : [...prev, nivelId]
    );
    if (!lecciones[nivelId]) {
      const token = localStorage.getItem("token");
      if (token) {
        getLecciones(nivelId, token).then((lecs) =>
          setLecciones((prev) => ({ ...prev, [nivelId]: lecs }))
        );
      }
    }
  };

  const handleExpandLeccion = (leccionId: string) => {
    setExpandedLecciones((prev) =>
      prev.includes(leccionId) ? prev.filter((id) => id !== leccionId) : [...prev, leccionId]
    );
    if (!recursos[leccionId]) {
      const token = localStorage.getItem("token");
      if (token) {
        getRecursos(leccionId, token).then((recs) =>
          setRecursos((prev) => ({ ...prev, [leccionId]: recs }))
        );
      }
    }
  };

  const handleRecursoClick = (recursoId: string) => {
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    params.set("recurso", recursoId);
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  if (loading) {
    return (
      <aside className="w-72 bg-white rounded-2xl border border-[var(--color-border)] p-4 shadow-sm">
        <div className="text-sm text-[var(--color-text-light)]">
          Cargando estructura...
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-72 bg-white rounded-2xl border border-[var(--color-border)] p-5 h-full flex flex-col shadow-sm">
      <h2 className="text-lg md:text-xl font-bold mb-4 text-[var(--color-primary)]">
        Estructura del Curso
      </h2>
      <div className="flex-1 overflow-y-auto pr-1 space-y-2">
        {niveles.length === 0 && (
          <div className="text-[var(--color-text-light)] text-sm">
            No hay niveles en este curso.
          </div>
        )}
        {niveles
          .sort((a, b) => a.orden - b.orden)
          .map((nivel) => (
            <div key={nivel.id} className="mb-1">
              <button
                className="font-semibold text-[var(--color-text)] hover:text-[var(--color-primary)] text-sm focus:outline-none"
                onClick={() => handleExpandNivel(nivel.id)}
              >
                {expandedNiveles.includes(nivel.id) ? "▼" : "►"} {nivel.nombre}
              </button>

              {/* Lecciones */}
              {expandedNiveles.includes(nivel.id) && lecciones[nivel.id] && (
                <div className="ml-4 mt-1 space-y-1">
                  {lecciones[nivel.id].length === 0 && (
                    <div className="text-gray-400 text-xs">Sin lecciones</div>
                  )}
                  {lecciones[nivel.id].map((leccion) => (
                    <div key={leccion.id} className="mb-1">
                      <button
                        className="text-[var(--color-primary)] hover:underline text-sm focus:outline-none"
                        onClick={() => handleExpandLeccion(leccion.id)}
                      >
                        {expandedLecciones.includes(leccion.id) ? "▼" : "►"} {leccion.nombre}
                      </button>

                      {/* Recursos */}
                      {expandedLecciones.includes(leccion.id) && recursos[leccion.id] && (
                        <ul className="ml-4 mt-1 space-y-0.5">
                          {recursos[leccion.id].length === 0 && (
                            <li className="text-gray-400 text-xs">Sin recursos</li>
                          )}
                          {recursos[leccion.id].map((recurso) => (
                            <li
                              key={recurso.id}
                              className="flex items-center gap-2 py-0.5"
                            >
                              <button
                                className={`text-[var(--color-text)] hover:text-[var(--color-primary)] hover:underline focus:outline-none text-sm flex items-center ${
                                  recursoActivo === recurso.id
                                    ? "font-semibold text-[var(--color-primary)]"
                                    : ""
                                }`}
                                style={{
                                  background: "none",
                                  border: "none",
                                  padding: 0,
                                  cursor: "pointer",
                                }}
                                onClick={() => handleRecursoClick(recurso.id)}
                              >
                                {getRecursoIcon(recurso.tipo)}
                                {recurso.nombre}
                              </button>
                              <span className="text-xs bg-[var(--color-bg)] text-[var(--color-text-light)] px-2 py-0.5 rounded-full capitalize">
                                {recurso.tipo}
                              </span>
                              {recurso.es_evaluable && (
                                <span title="Recurso evaluable">
                                  <FaRegCheckCircle className="text-emerald-500" />
                                </span>
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
      <div className="mt-4" />
    </aside>
  );
}
