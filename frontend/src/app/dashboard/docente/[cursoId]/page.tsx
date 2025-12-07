"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getCursoDetalleDocente, getEstudiantesCurso } from "@/services/cursos";
import Link from "next/link";
import { FiBarChart2 } from "react-icons/fi";
import DocenteCourseTree from "./components/DocenteCourseTree";
import TablaRecomendacionesIA from "./components/TablaRecomendacionesIA";

interface Estudiante {
  id: string;
  nombre: string;
  email: string;
  progreso: number; // porcentaje
  estado: "Listo" | "Observacion" | "Refuerzo";
}

export default function DocenteCursoPage() {
  const [curso, setCurso] = useState<any>(null);
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [loading, setLoading] = useState(true);

  // Obtiene el cursoId de la URL usando useParams de Next.js
  const params = useParams();
  const cursoId = Array.isArray(params?.cursoId) ? params.cursoId[0] : params?.cursoId;

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && cursoId) {
      setLoading(true);
      getCursoDetalleDocente(cursoId, token).then(setCurso);
      getEstudiantesCurso(cursoId, token)
        .then(setEstudiantes)
        .finally(() => setLoading(false));
    }
  }, [cursoId]);

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-lg text-[var(--color-primary)]">
          Cargando información del curso...
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full p-4 md:p-6 space-y-8">
      {/* Header del curso */}
      <div className="flex flex-col gap-3 mb-2">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-primary)] mb-1">
            {curso?.nombre || "Curso"}
          </h1>
          <p className="text-base md:text-lg text-[var(--color-text-light)]">
            {curso?.descripcion}
          </p>
        </div>

        {/* Tabs / botones de navegación del curso */}
        <div className="flex flex-wrap gap-3 mt-2">
          <Link
            href={`/dashboard/docente/${cursoId}`}
            className="px-4 py-2 rounded-lg bg-[var(--color-primary)] text-white text-sm md:text-base
                       font-medium hover:bg-blue-600 transition"
          >
            Inicio
          </Link>

          <Link
            href={`/dashboard/docente/${cursoId}/reportes`}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-secondary)] text-white 
                       text-sm md:text-base font-medium hover:bg-violet-500 transition"
          >
            <FiBarChart2 className="text-lg" />
            Reportes
          </Link>

          <Link
            href={`/dashboard/docente/${cursoId}/historial`}
            className="px-4 py-2 rounded-lg bg-[var(--color-bg)] text-[var(--color-text)] text-sm md:text-base 
                       font-medium hover:bg-blue-50 border border-[var(--color-border)] transition"
          >
            Historial
          </Link>
        </div>
      </div>

      {/* Árbol de gestión docente (estructura del curso) */}
      <DocenteCourseTree cursoId={cursoId || ""} />

      {/* Lista de estudiantes */}
      <div className="bg-white rounded-2xl shadow-sm border border-[var(--color-border)] p-6">
        <h2 className="text-2xl font-bold text-[var(--color-primary)] mb-4">
          Estudiantes inscritos
        </h2>

        {estudiantes.length === 0 ? (
          <div className="text-[var(--color-text-light)]">
            No hay estudiantes inscritos en este curso.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-[var(--color-bg)] text-[var(--color-primary)]">
                  <th className="py-2 px-4 text-left">Nombre</th>
                  <th className="py-2 px-4 text-left">Email</th>
                  <th className="py-2 px-4 text-center">Progreso</th>
                  <th className="py-2 px-4 text-center">Estado</th>
                  <th className="py-2 px-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {estudiantes.map((est) => (
                  <tr
                    key={est.id}
                    className="border-b border-[var(--color-border)] hover:bg-blue-50/50"
                  >
                    <td className="py-2 px-4">{est.nombre}</td>
                    <td className="py-2 px-4">{est.email}</td>
                    <td className="py-2 px-4 text-center">
                      <div className="w-32 bg-gray-200 rounded-full h-3 mx-auto">
                        <div
                          className={`h-3 rounded-full ${
                            est.progreso >= 80
                              ? "bg-green-400"
                              : est.progreso >= 50
                              ? "bg-yellow-400"
                              : "bg-red-400"
                          }`}
                          style={{ width: `${est.progreso}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-600 ml-2">
                        {est.progreso}%
                      </span>
                    </td>
                    <td className="py-2 px-4 text-center">
                      {est.estado === "Listo" && (
                        <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 font-semibold">
                          Listo
                        </span>
                      )}
                      {est.estado === "Observacion" && (
                        <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 font-semibold">
                          Observación
                        </span>
                      )}
                      {est.estado === "Refuerzo" && (
                        <span className="px-2 py-1 rounded-full bg-red-100 text-red-700 font-semibold">
                          Refuerzo
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-4 text-center">
                      <Link
                        href={`/dashboard/docente/${cursoId}/estudiante/${est.id}`}
                        className="text-[var(--color-primary)] hover:underline font-medium"
                      >
                        Ver detalle
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
