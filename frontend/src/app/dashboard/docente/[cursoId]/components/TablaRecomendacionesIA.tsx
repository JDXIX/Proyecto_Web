"use client";

import { useEffect, useState } from "react";
import axios from "axios";

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

export default function TablaRecomendacionesIA({ cursoId }: { cursoId: string }) {
  const [recomendaciones, setRecomendaciones] = useState<Recomendacion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    axios
      .get("http://localhost:8000/api/recomendaciones/?estado=pendiente", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setRecomendaciones(res.data))
      .catch(() => setError("No se pudieron cargar las recomendaciones."))
      .finally(() => setLoading(false));
  }, [token]);

  const aprobar = async (id: string) => {
    if (!token) return;
    await axios.post(`http://localhost:8000/api/recomendaciones/${id}/aprobar/`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setRecomendaciones((prev) => prev.filter((r) => r.id !== id));
  };

  const descartar = async (id: string) => {
    if (!token) return;
    await axios.post(`http://localhost:8000/api/recomendaciones/${id}/descartar/`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setRecomendaciones((prev) => prev.filter((r) => r.id !== id));
  };

  if (loading) return <div>Cargando recomendaciones...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="mt-8">
      <h3 className="text-xl font-bold mb-4 text-[#003087]">Recomendaciones IA pendientes</h3>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th>Estudiante</th>
            <th>Fase</th>
            <th>Mensaje</th>
            <th>Acciones</th>
            <th>Fecha</th>
            <th>Aprobar</th>
            <th>Descartar</th>
          </tr>
        </thead>
        <tbody>
          {recomendaciones.map((rec) => (
            <tr key={rec.id} className="border-t">
              <td>{rec.estudiante}</td>
              <td>{rec.fase}</td>
              <td>{rec.mensaje}</td>
              <td>
                {Array.isArray(rec.acciones)
                  ? rec.acciones.map((a: any, i: number) => (
                      <div key={i}>{a.descripcion}</div>
                    ))
                  : ""}
              </td>
              <td>{new Date(rec.fecha).toLocaleString()}</td>
              <td>
                <button
                  className="bg-green-600 text-white px-2 py-1 rounded"
                  onClick={() => aprobar(rec.id)}
                >
                  Aprobar
                </button>
              </td>
              <td>
                <button
                  className="bg-red-600 text-white px-2 py-1 rounded"
                  onClick={() => descartar(rec.id)}
                >
                  Descartar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {recomendaciones.length === 0 && (
        <div className="text-gray-500 mt-4">No hay recomendaciones pendientes.</div>
      )}
    </div>
  );
}