"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";

interface ReporteEstudiante {
  id: string;
  nombre: string;
  email: string;
  nivel: string;
  leccion: string;
  actividad: string;
  score_atencion: number;
  nota_academica: number;
  nota_combinada: number;
  estado: string;
  fecha: string;
}

export default function ReportesDocentePage({ params }: { params: { cursoId: string } }) {
  const [reportes, setReportes] = useState<ReporteEstudiante[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const { cursoId } = params;

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    axios
      .get(`http://localhost:8000/api/historial-estudiantes/?curso=${cursoId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        // Calcula nota combinada para cada registro
        const data = Array.isArray(res.data) ? res.data : [];
        setReportes(
          data.map((r: any) => ({
            ...r,
            nota_combinada:
              r.score_atencion !== null && r.nota_academica !== null
                ? Math.round(0.4 * (r.score_atencion ?? 0) + 0.6 * (r.nota_academica ?? 0))
                : "-",
          }))
        );
      })
      .catch(() => setError("No se pudo cargar el reporte del curso."))
      .finally(() => setLoading(false));
  }, [token, cursoId]);

  // Exportar a CSV
  const exportarCSV = () => {
    const encabezado = [
      "Estudiante",
      "Email",
      "Nivel",
      "Lección",
      "Actividad",
      "Atención",
      "Nota",
      "Nota combinada",
      "Estado",
      "Fecha",
    ];
    const filas = reportes.map((r) => [
      r.nombre,
      r.email,
      r.nivel,
      r.leccion,
      r.actividad,
      r.score_atencion ?? "-",
      r.nota_academica ?? "-",
      r.nota_combinada ?? "-",
      r.estado,
      r.fecha ? new Date(r.fecha).toLocaleString() : "-",
    ]);
    const csv =
      [encabezado, ...filas]
        .map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
        .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reporte_curso_${cursoId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#F5F8FA] py-8 px-4">
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow p-8">
        <h1 className="text-3xl font-bold text-[#003087] mb-6">
          Reporte General del Curso
        </h1>
        <p className="mb-6 text-gray-700">
          Visualiza el monitoreo y progreso de todos los estudiantes. Exporta los datos para analisis externo.
        </p>
        <div className="flex flex-wrap gap-4 mb-6">
          <Link
            href={`/dashboard/docente/${cursoId}`}
            className="px-4 py-2 bg-[#00B7EB] text-white rounded hover:bg-[#0099c6] transition"
          >
            Volver al panel docente
          </Link>
          <button
            onClick={exportarCSV}
            className="px-4 py-2 bg-[#003087] text-white rounded hover:bg-[#001f5c] transition"
          >
            Exportar CSV
          </button>
        </div>
        {loading ? (
          <div className="text-center text-[#003087]">Cargando reporte...</div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border">
              <thead>
                <tr className="bg-[#E6F0FA] text-[#003087]">
                  <th className="py-2 px-4 text-left">Estudiante</th>
                  <th className="py-2 px-4 text-left">Email</th>
                  <th className="py-2 px-4 text-left">Nivel</th>
                  <th className="py-2 px-4 text-left">Lección</th>
                  <th className="py-2 px-4 text-left">Recurso</th>
                  <th className="py-2 px-4 text-center">Atención</th>
                  <th className="py-2 px-4 text-center">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {reportes.map((r, i) => (
                  <tr key={i} className="border-b hover:bg-[#F4F8FB]">
                    <td className="py-2 px-4">{r.nombre}</td>
                    <td className="py-2 px-4">{r.email}</td>
                    <td className="py-2 px-4">{r.nivel}</td>
                    <td className="py-2 px-4">{r.leccion}</td>
                    <td className="py-2 px-4">{r.actividad}</td>
                    <td className="py-2 px-4 text-center">{r.score_atencion ?? "-"}</td>
                    <td className="py-2 px-4 text-center">{r.nota_academica ?? "-"}</td>
                    <td className="py-2 px-4 text-center">{r.nota_combinada ?? "-"}</td>
                    <td className="py-2 px-4 text-center">
                      {r.estado === "Listo" && (
                        <span className="px-2 py-1 rounded bg-green-100 text-green-700 font-semibold">Listo</span>
                      )}
                      {r.estado === "Observacion" && (
                        <span className="px-2 py-1 rounded bg-yellow-100 text-yellow-700 font-semibold">Observación</span>
                      )}
                      {r.estado === "Refuerzo" && (
                        <span className="px-2 py-1 rounded bg-red-100 text-red-700 font-semibold">Refuerzo</span>
                      )}
                      {!["Listo", "Observacion", "Refuerzo"].includes(r.estado) && (
                        <span className="px-2 py-1 rounded bg-gray-100 text-gray-700 font-semibold">{r.estado}</span>
                      )}
                    </td>
                    <td className="py-2 px-4 text-center">
                      {r.fecha ? new Date(r.fecha).toLocaleString() : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {reportes.length === 0 && (
              <div className="text-gray-500 mt-4">No hay datos de reporte aún.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}