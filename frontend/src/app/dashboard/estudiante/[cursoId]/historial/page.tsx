"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";

interface Historial {
  id: string;
  curso: string;
  nivel: string;
  fase: string; // Backend uses 'fase' field
  actividad: string;
  score_atencion: number;
  nota_academica: number;
  estado: string;
  fecha: string;
  recomendacion: {
    mensaje: string;
    acciones: any;
    estado: string;
  };
}

export default function HistorialEstudiantePage({ params }: { params: { cursoId: string } }) {
  const [historial, setHistorial] = useState<Historial[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const estudianteId = typeof window !== "undefined" ? localStorage.getItem("user_id") : null;
  const { cursoId } = params;

  useEffect(() => {
    if (!token || !estudianteId) return;
    setLoading(true);
    axios
      .get(`http://localhost:8000/api/historial-estudiantes/?curso=${cursoId}&estudiante=${estudianteId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setHistorial(res.data))
      .catch(() => setError("No se pudo cargar tu historial."))
      .finally(() => setLoading(false));
  }, [token, cursoId, estudianteId]);

  return (
    <div className="min-h-screen bg-[#F5F8FA] py-8 px-4">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow p-8">
        <h1 className="text-3xl font-bold text-[#003087] mb-6">
          Mi Historial de Recomendaciones IA
        </h1>
        <p className="mb-6 text-gray-700">
          Consulta tus recomendaciones personalizadas y monitoreo de atención, asegurando transparencia y mejora continua conforme a la <b>norma ISO 21001:2018</b>.
        </p>
        <Link
          href={`/dashboard/estudiante/${cursoId}`}
          className="inline-block mb-4 px-4 py-2 bg-[#00B7EB] text-white rounded hover:bg-[#0099c6] transition"
        >
          Volver al curso
        </Link>
        {loading ? (
          <div className="text-center text-[#003087]">Cargando historial...</div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border">
              <thead>
                <tr className="bg-[#E6F0FA] text-[#003087]">
                  <th className="py-2 px-4 text-left">Nivel</th>
                  <th className="py-2 px-4 text-left">Lección</th>
                  <th className="py-2 px-4 text-left">Actividad</th>
                  <th className="py-2 px-4 text-center">Atención</th>
                  <th className="py-2 px-4 text-center">Nota</th>
                  <th className="py-2 px-4 text-left">Recomendación IA</th>
                  <th className="py-2 px-4 text-center">Estado</th>
                  <th className="py-2 px-4 text-center">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {historial.map((h) => (
                  <tr key={h.id} className="border-b hover:bg-[#F4F8FB]">
                    <td className="py-2 px-4">{h.nivel}</td>
                    <td className="py-2 px-4">{h.fase}</td>
                    <td className="py-2 px-4">{h.actividad}</td>
                    <td className="py-2 px-4 text-center">{h.score_atencion ?? "-"}</td>
                    <td className="py-2 px-4 text-center">{h.nota_academica ?? "-"}</td>
                    <td className="py-2 px-4">
                      <div className="font-semibold">{h.recomendacion?.mensaje}</div>
                      {Array.isArray(h.recomendacion?.acciones) &&
                        h.recomendacion.acciones.map((a: any, i: number) => (
                          <div key={i} className="text-xs text-gray-700">
                            - {a.descripcion}
                          </div>
                        ))}
                    </td>
                    <td className="py-2 px-4 text-center">
                      {h.estado === "aprobada" && (
                        <span className="px-2 py-1 rounded bg-green-100 text-green-700 font-semibold">Aprobada</span>
                      )}
                      {h.estado === "descartada" && (
                        <span className="px-2 py-1 rounded bg-red-100 text-red-700 font-semibold">Descartada</span>
                      )}
                      {h.estado === "pendiente" && (
                        <span className="px-2 py-1 rounded bg-yellow-100 text-yellow-700 font-semibold">Pendiente</span>
                      )}
                    </td>
                    <td className="py-2 px-4 text-center">
                      {h.fecha ? new Date(h.fecha).toLocaleString() : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {historial.length === 0 && (
              <div className="text-gray-500 mt-4">No hay historial registrado aún.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}