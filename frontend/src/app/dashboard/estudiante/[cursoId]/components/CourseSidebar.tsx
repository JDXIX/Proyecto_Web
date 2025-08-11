"use client";

import { useEffect, useState } from "react";
import { getNiveles, getLecciones, getRecursos } from "@/services/cursos";
import { useSearchParams, useRouter } from "next/navigation";

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
    getNiveles(cursoId, token).then(nivelesData => {
      setNiveles(nivelesData);
      setLoading(false);
    });
  }, [cursoId]);

  const handleExpandNivel = (nivelId: string) => {
    setExpandedNiveles(prev =>
      prev.includes(nivelId) ? prev.filter(id => id !== nivelId) : [...prev, nivelId]
    );
    if (!lecciones[nivelId]) {
      const token = localStorage.getItem("token");
      if (token) {
        getLecciones(nivelId, token).then(lecs =>
          setLecciones(prev => ({ ...prev, [nivelId]: lecs }))
        );
      }
    }
  };

  const handleExpandLeccion = (leccionId: string) => {
    setExpandedLecciones(prev =>
      prev.includes(leccionId) ? prev.filter(id => id !== leccionId) : [...prev, leccionId]
    );
    if (!recursos[leccionId]) {
      const token = localStorage.getItem("token");
      if (token) {
        getRecursos(leccionId, token).then(recs =>
          setRecursos(prev => ({ ...prev, [leccionId]: recs }))
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
    return <div className="p-4">Cargando estructura...</div>;
  }

  return (
    <aside className="w-72 bg-white border-r p-4 h-full">
      <h2 className="text-xl font-bold mb-4 text-[#003087]">Estructura del Curso</h2>
      <div>
        {niveles.length === 0 && (
          <div className="text-gray-500">No hay niveles en este curso.</div>
        )}
        {niveles
          .sort((a, b) => a.orden - b.orden)
          .map(nivel => (
            <div key={nivel.id} className="mb-2">
              <button
                className="font-semibold text-[#003087] focus:outline-none"
                onClick={() => handleExpandNivel(nivel.id)}
              >
                {expandedNiveles.includes(nivel.id) ? "▼" : "►"} {nivel.nombre}
              </button>
              {/* Lecciones */}
              {expandedNiveles.includes(nivel.id) && lecciones[nivel.id] && (
                <div className="ml-4 mt-1">
                  {lecciones[nivel.id].length === 0 && (
                    <div className="text-gray-400 text-sm">Sin lecciones</div>
                  )}
                  {lecciones[nivel.id].map(leccion => (
                    <div key={leccion.id} className="mb-1">
                      <button
                        className="text-[#00B7EB] focus:outline-none"
                        onClick={() => handleExpandLeccion(leccion.id)}
                      >
                        {expandedLecciones.includes(leccion.id) ? "▼" : "►"} {leccion.nombre}
                      </button>
                      {/* Recursos */}
                      {expandedLecciones.includes(leccion.id) && recursos[leccion.id] && (
                        <ul className="ml-4 mt-1">
                          {recursos[leccion.id].length === 0 && (
                            <li className="text-gray-400 text-xs">Sin recursos</li>
                          )}
                          {recursos[leccion.id].map(recurso => (
                            <li key={recurso.id} className="flex items-center gap-2">
                              <button
                                className={`text-gray-700 hover:underline focus:outline-none ${
                                  recursoActivo === recurso.id ? "font-bold text-[#003087]" : ""
                                }`}
                                style={{
                                  background: "none",
                                  border: "none",
                                  padding: 0,
                                  cursor: "pointer",
                                }}
                                onClick={() => handleRecursoClick(recurso.id)}
                              >
                                {recurso.nombre}
                              </button>
                              <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">{recurso.tipo}</span>
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