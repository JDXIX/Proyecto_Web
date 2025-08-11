"use client";

import { useState, useEffect } from "react";
import { crearNivel, editarNivel } from "@/services/cursos";

interface NivelFormModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  cursoId: string;
  nivel?: { id: string; nombre: string; orden: number };
}

export default function NivelFormModal({
  open,
  onClose,
  onSuccess,
  cursoId,
  nivel,
}: NivelFormModalProps) {
  const [nombre, setNombre] = useState(nivel?.nombre || "");
  const [orden, setOrden] = useState(nivel?.orden || 1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setNombre(nivel?.nombre || "");
    setOrden(nivel?.orden || 1);
    setError("");
  }, [nivel, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const token = localStorage.getItem("token");
    try {
      if (nivel) {
        await editarNivel(nivel.id, { nombre, orden, curso: cursoId }, token!);
      } else {
        await crearNivel({ nombre, orden, curso: cursoId }, token!);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError("Error al guardar el nivel.");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md"
      >
        <h2 className="text-xl font-bold mb-4 text-[#003087]">
          {nivel ? "Editar Nivel" : "Agregar Nivel"}
        </h2>
        <div className="mb-4">
          <label className="block font-medium mb-1">Nombre del Nivel</label>
          <input
            type="text"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div className="mb-4">
          <label className="block font-medium mb-1">Orden</label>
          <input
            type="number"
            value={orden}
            onChange={e => setOrden(Number(e.target.value))}
            min={1}
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>
        {error && <div className="text-red-600 mb-2">{error}</div>}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded bg-[#00B7EB] text-white hover:bg-[#0099c6]"
            disabled={loading}
          >
            {nivel ? "Guardar Cambios" : "Crear Nivel"}
          </button>
        </div>
      </form>
    </div>
  );
}