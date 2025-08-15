"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getEstudiantesCurso } from "@/services/cursos";
import Link from "next/link";

interface Estudiante {
  id: string;
  nombre: string;
  email: string;
  progreso: number;
  estado: "Listo" | "Observacion" | "Refuerzo";
}

export default function EstudiantesInscritosPage() {
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const cursoId = Array.isArray(params?.cursoId) ? params.cursoId[0] : params?.cursoId;

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && cursoId) {
      setLoading(true);
      getEstudiantesCurso(cursoId, token)
        .then(setEstudiantes)
        .finally(() => setLoading(false));
    }
  }, [cursoId]);

  return (
    <div className="min-h-screen bg-[#F5F8FA] py-8 px-4">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow p-8">
        <h1 className="text-3xl font-bold text-[#003087] mb-6">
          Estudiantes inscritos
        </h1>
        {loading ? (
          <div className="text-center text-[#003087]">Cargando estudiantes...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border">
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
                        href={`/dashboard/docente/${cursoId}/estudiante/${est.id}`}
                        className="text-[#00B7EB] hover:underline"
                      >
                        Ver detalle
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {estudiantes.length === 0 && (
              <div className="text-gray-500 mt-4">No hay estudiantes inscritos en este curso.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}