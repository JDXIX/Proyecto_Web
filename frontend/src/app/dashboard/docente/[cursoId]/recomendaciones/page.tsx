"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";

// Helpers para mostrar nombres legibles
async function getUsuarioNombre(id: string, token: string) {
  if (!id) return "";
  try {
    const res = await axios.get(`http://localhost:8000/api/usuarios/${id}/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const u = res.data || {};
    return `${u.first_name || ""} ${u.last_name || ""}`.trim() || u.username || u.email || id;
  } catch {
    return id;
  }
}

async function getLeccionNombre(id: string, token: string) {
  if (!id) return "";
  try {
    const res = await axios.get(`http://localhost:8000/api/fases/${id}/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data?.nombre || id;
  } catch {
    return id;
  }
}

interface Recomendacion {
  id: string;
  estudiante: string;
  leccion?: string;
  fase?: string;
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
  const [userNames, setUserNames] = useState<Record<string, string>>({});
  const [leccionNames, setLeccionNames] = useState<Record<string, string>>({});

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const cursoId = params.cursoId;

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    axios
      .get(`http://localhost:8000/api/recomendaciones/?curso=${cursoId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(async (res) => {
        const data = res.data || [];
        setRecomendaciones(data);

        // IDs únicos de estudiantes y lecciones
        const estIds = Array.from(new Set(data.map((r: any) => r.estudiante).filter(Boolean))) as string[];
        const faseIds = Array.from(new Set(data.map((r: any) => r.fase).filter(Boolean))) as string[];

        // Resuelve nombres en paralelo
        const [userMap, leccionMap] = await Promise.all([
          (async () => {
            const map: Record<string, string> = {};
            await Promise.all(estIds.map(async (id) => (map[id] = await getUsuarioNombre(id, token))));
            return map;
          })(),
          (async () => {
            const map: Record<string, string> = {};
            await Promise.all(faseIds.map(async (id) => (map[id] = await getLeccionNombre(id, token))));
            return map;
          })(),
        ]);
        setUserNames(userMap);
        setLeccionNames(leccionMap);
      })
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
                  <th className="py-2 px-4 text-left">Lección</th>
                  <th className="py-2 px-4 text-left">Mensaje</th>
                  <th className="py-2 px-4 text-left">Acciones</th>
                  <th className="py-2 px-4 text-center">Estado</th>
                  <th className="py-2 px-4 text-center">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {recomendaciones.map((rec) => (
                  <tr key={rec.id} className="border-b hover:bg-[#F4F8FB]">
                    <td className="py-2 px-4">{userNames[rec.estudiante] || rec.estudiante}</td>
                    <td className="py-2 px-4">{leccionNames[rec.fase || ""] || rec.fase}</td>
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