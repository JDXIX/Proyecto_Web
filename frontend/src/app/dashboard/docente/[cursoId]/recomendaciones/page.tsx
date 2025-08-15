"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";

interface Recomendacion {
  id: string;
  estudiante: string;
  fase: string;
  mensaje: string;
  acciones: any;
  estado: string;
  docente_aprobo: boolean;
  fecha: string;
}

export default function RecomendacionesDocentePage({ params }: { params: { cursoId: string } }) {
  const [recomendaciones, setRecomendaciones] = useState<Recomendacion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const cursoId = params.cursoId;

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    axios
      .get(`http://localhost:8000/api/recomendaciones/?curso=${cursoId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setRecomendaciones(res.data))
      .catch(() => setError("No se pudieron cargar las recomendaciones."))
      .finally(() => setLoading(false));
  }, [token, cursoId]);

  return (
    <div className="min-h-screen bg-[#F5F8FA] py-8 px-4">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow p-8">
        <h1 className="text-3xl font-bold text-[#003087] mb-6">
          Historial de Recomendaciones IA
        </h1>
        <p className="mb-6 text-gray-700">
          Visualiza todas las recomendaciones generadas, aprobadas o descartadas, con trazabilidad y transparencia conforme a la <b>norma ISO 21001:2018</b>.
        </p>
        <Link
          href={`/dashboard/docente/${cursoId}`}
          className="inline-block mb-4 px-4 py-2 bg-[#00B7EB] text-white rounded hover:bg-[#0099c6] transition"
        >
          Volver al panel docente
        </Link>
        {loading ? (
          <div className="text-center text-[#003087]">Cargando recomendaciones...</div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border">
              <thead>
                <tr className="bg-[#E6F0FA] text-[#003087]">
                  <th className="py-2 px-4 text-left">Estudiante</th>
                  <th className="py-2 px-4 text-left">Fase</th>
                  <th className="py-2 px-4 text-left">Mensaje</th>
                  <th className="py-2 px-4 text-left">Acciones</th>
                  <th className="py-2 px-4 text-center">Estado</th>
                  <th className="py-2 px-4 text-center">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {recomendaciones.map((rec) => (
                  <tr key={rec.id} className="border-b hover:bg-[#F4F8FB]">
                    <td className="py-2 px-4">{rec.estudiante}</td>
                    <td className="py-2 px-4">{rec.fase}</td>
                    <td className="py-2 px-4">{rec.mensaje}</td>
                    <td className="py-2 px-4">
                      {Array.isArray(rec.acciones)
                        ? rec.acciones.map((a: any, i: number) => (
                            <div key={i}>{a.descripcion}</div>
                          ))
                        : ""}
                    </td>
                    <td className="py-2 px-4 text-center">
                      {rec.estado === "aprobada" && (
                        <span className="px-2 py-1 rounded bg-green-100 text-green-700 font-semibold">Aprobada</span>
                      )}
                      {rec.estado === "descartada" && (
                        <span className="px-2 py-1 rounded bg-red-100 text-red-700 font-semibold">Descartada</span>
                      )}
                      {rec.estado === "pendiente" && (
                        <span className="px-2 py-1 rounded bg-yellow-100 text-yellow-700 font-semibold">Pendiente</span>
                      )}
                    </td>
                    <td className="py-2 px-4 text-center">
                      {new Date(rec.fecha).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {recomendaciones.length === 0 && (
              <div className="text-gray-500 mt-4">No hay recomendaciones registradas.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}