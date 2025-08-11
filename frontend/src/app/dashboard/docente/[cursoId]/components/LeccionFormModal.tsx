"use client";

import { useState, useEffect } from "react";
import { crearLeccion, editarLeccion } from "@/services/cursos";

interface LeccionFormModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  nivelId: string;
  leccion?: { id: string; nombre: string };
}

export default function LeccionFormModal({
  open,
  onClose,
  onSuccess,
  nivelId,
  leccion,
}: LeccionFormModalProps) {
  const [nombre, setNombre] = useState(leccion?.nombre || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setNombre(leccion?.nombre || "");
    setError("");
  }, [leccion, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const token = localStorage.getItem("token");
    try {
      if (leccion) {
        await editarLeccion(leccion.id, { nombre, nivel: nivelId }, token!);
      } else {
        await crearLeccion({ nombre, nivel: nivelId }, token!);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError("Error al guardar la lección.");
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
          {leccion ? "Editar Lección" : "Agregar Lección"}
        </h2>
        <div className="mb-4">
          <label className="block font-medium mb-1">Nombre de la Lección</label>
          <input
            type="text"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
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
            {leccion ? "Guardar Cambios" : "Crear Lección"}
          </button>
        </div>
      </form>
    </div>
  );
}