"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getCursoDetalleDocente, getEstudiantesCurso } from "@/services/cursos";
import Link from "next/link";
import { FiBarChart2, FiMessageSquare } from "react-icons/fi";
import DocenteCourseTree from "./components/DocenteCourseTree";

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
      getEstudiantesCurso(cursoId, token).then(setEstudiantes).finally(() => setLoading(false));
    }
  }, [cursoId]);

  return (
    <div className="w-full h-full p-4 md:p-8">
      {loading ? (
        <div className="text-center text-lg text-[#003087]">Cargando información del curso...</div>
      ) : (
        <>
          {/* Resumen del curso */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#003087] mb-2">{curso?.nombre || "Curso"}</h1>
            <p className="text-lg text-gray-700 mb-2">{curso?.descripcion}</p>
            <div className="flex gap-4 mt-4">
              <Link
                href={`/dashboard/docente/${cursoId}/reportes`}
                className="flex items-center gap-2 px-4 py-2 bg-[#00B7EB] text-white rounded hover:bg-[#0099c6] transition"
              >
                <FiBarChart2 className="text-xl" />
                Ver Reportes
              </Link>
              <Link
                href={`/dashboard/docente/${cursoId}/recomendaciones`}
                className="flex items-center gap-2 px-4 py-2 bg-[#003087] text-white rounded hover:bg-[#001f5c] transition"
              >
                <FiMessageSquare className="text-xl" />
                Recomendaciones IA
              </Link>
            </div>
          </div>

          {/* Árbol de gestión docente */}
          <DocenteCourseTree cursoId={cursoId || ""} />

          {/* Lista de estudiantes */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-[#003087] mb-4">Estudiantes inscritos</h2>
            {estudiantes.length === 0 ? (
              <div className="text-gray-600">No hay estudiantes inscritos en este curso.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-[#E6F0FA] text-[#003087]">
                      <th className="py-2 px-4 text-left">Nombre</th>
                      <th className="py-2 px-4 text-left">Email</th>
                      <th className="py-2 px-4 text-center">Progreso</th>
                      <th className="py-2 px-4 text-center">Estado</th>
                      <th className="py-2 px-4 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {estudiantes.map(est => (
                      <tr key={est.id} className="border-b hover:bg-[#F4F8FB]">
                        <td className="py-2 px-4">{est.nombre}</td>
                        <td className="py-2 px-4">{est.email}</td>
                        <td className="py-2 px-4 text-center">
                          <div className="w-32 bg-gray-200 rounded-full h-3">
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
                          <span className="text-xs text-gray-600 ml-2">{est.progreso}%</span>
                        </td>
                        <td className="py-2 px-4 text-center">
                          {est.estado === "Listo" && (
                            <span className="px-2 py-1 rounded bg-green-100 text-green-700 font-semibold">Listo</span>
                          )}
                          {est.estado === "Observacion" && (
                            <span className="px-2 py-1 rounded bg-yellow-100 text-yellow-700 font-semibold">Observación</span>
                          )}
                          {est.estado === "Refuerzo" && (
                            <span className="px-2 py-1 rounded bg-red-100 text-red-700 font-semibold">Refuerzo</span>
                          )}
                        </td>
                        <td className="py-2 px-4 text-center">
                          <Link
                            href={`/dashboard/docente/${cursoId}/reportes?estudiante=${est.id}`}
                            className="text-[#00B7EB] hover:underline"
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
        </>
      )}
    </div>
  );
}