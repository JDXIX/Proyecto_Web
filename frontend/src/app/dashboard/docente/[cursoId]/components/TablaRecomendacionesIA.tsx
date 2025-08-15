"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { FiEdit } from "react-icons/fi";

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

  // Modal de edición (puedes implementar un modal real si lo deseas)
  const [editando, setEditando] = useState<Recomendacion | null>(null);
  const [nuevoMensaje, setNuevoMensaje] = useState("");
  const [guardando, setGuardando] = useState(false);

  const editar = (rec: Recomendacion) => {
    setEditando(rec);
    setNuevoMensaje(rec.mensaje);
  };

  const guardarEdicion = async () => {
    if (!editando || !token) return;
    setGuardando(true);
    await axios.post(
      `http://localhost:8000/api/recomendaciones/${editando.id}/editar/`,
      { mensaje: nuevoMensaje },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setRecomendaciones((prev) =>
      prev.map((r) => (r.id === editando.id ? { ...r, mensaje: nuevoMensaje } : r))
    );
    setEditando(null);
    setGuardando(false);
  };

  if (loading) return <div>Cargando recomendaciones...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="mt-8">
      <h3 className="text-xl font-bold mb-4 text-[#003087]">Recomendaciones IA pendientes</h3>
      <table className="w-full border">
        <thead>
          <tr className="bg-[#E6F0FA] text-[#003087]">
            <th className="py-2 px-4">Estudiante</th>
            <th className="py-2 px-4">Lección</th>
            <th className="py-2 px-4">Mensaje</th>
            <th className="py-2 px-4">Acciones</th>
            <th className="py-2 px-4">Fecha</th>
            <th className="py-2 px-4">Aprobar</th>
            <th className="py-2 px-4">Descartar</th>
            <th className="py-2 px-4">Editar</th>
          </tr>
        </thead>
        <tbody>
          {recomendaciones.map((rec) => (
            <tr key={rec.id} className="border-t hover:bg-[#F4F8FB]">
              <td className="py-2 px-4">{rec.estudiante}</td>
              <td className="py-2 px-4">{rec.leccion || rec.fase}</td>
              <td className="py-2 px-4">{rec.mensaje}</td>
              <td className="py-2 px-4">
                {Array.isArray(rec.acciones)
                  ? rec.acciones.map((a: any, i: number) => (
                      <div key={i}>{a.descripcion}</div>
                    ))
                  : ""}
              </td>
              <td className="py-2 px-4">{new Date(rec.fecha).toLocaleString()}</td>
              <td className="py-2 px-4">
                <button
                  className="bg-[#22c55e] hover:bg-[#16a34a] text-white px-3 py-1 rounded font-semibold"
                  onClick={() => aprobar(rec.id)}
                >
                  Aprobar
                </button>
              </td>
              <td className="py-2 px-4">
                <button
                  className="bg-[#ef4444] hover:bg-[#dc2626] text-white px-3 py-1 rounded font-semibold"
                  onClick={() => descartar(rec.id)}
                >
                  Descartar
                </button>
              </td>
              <td className="py-2 px-4">
                <button
                  className="bg-[#00B7EB] hover:bg-[#0099c6] text-white px-2 py-1 rounded flex items-center gap-1"
                  onClick={() => editar(rec)}
                  title="Editar recomendación"
                >
                  <FiEdit /> Editar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {recomendaciones.length === 0 && (
        <div className="text-gray-500 mt-4">No hay recomendaciones pendientes.</div>
      )}

      {/* Modal simple para editar mensaje */}
      {editando && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-md w-full">
            <h3 className="text-lg font-bold mb-2 text-[#003087]">Editar recomendación IA</h3>
            <textarea
              className="w-full border rounded px-3 py-2 mb-4"
              rows={4}
              value={nuevoMensaje}
              onChange={(e) => setNuevoMensaje(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                onClick={() => setEditando(null)}
                disabled={guardando}
              >
                Cancelar
              </button>
              <button
                className="px-4 py-2 rounded bg-[#00B7EB] text-white hover:bg-[#0099c6]"
                onClick={guardarEdicion}
                disabled={guardando}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}