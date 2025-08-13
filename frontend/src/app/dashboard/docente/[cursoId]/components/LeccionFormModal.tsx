"use client";

import { useState, useEffect } from "react";
import { crearLeccion, editarLeccion } from "@/services/cursos";

interface LeccionFormModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  nivelId: string;
  leccion?: { id: string; nombre: string; orden: number };
  leccionesExistentes?: { id: string; nombre: string; orden: number }[];
}

export default function LeccionFormModal({
  open,
  onClose,
  onSuccess,
  nivelId,
  leccion,
  leccionesExistentes = [],
}: LeccionFormModalProps) {
  // Solo se edita el número (orden), el nombre es fijo
  const [orden, setOrden] = useState(leccion?.orden || 1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Generar nombre automáticamente
  const nombre = `Lección ${orden}`;

  useEffect(() => {
    setOrden(leccion?.orden || 1);
    setError("");
  }, [leccion, open]);

  // Obtener los números de lección ya usados (excepto el actual si está editando)
  const ordenesUsados = leccionesExistentes
    .filter(l => !leccion || l.id !== leccion.id)
    .map(l => l.orden);

  // Validar antes de enviar
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (orden < 1) {
      setError("El número de lección debe ser mayor o igual a 1.");
      return;
    }
    if (ordenesUsados.includes(orden)) {
      setError(`Ya existe una Lección ${orden}. Elija otro número.`);
      return;
    }
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      if (leccion) {
        await editarLeccion(leccion.id, { nombre, orden, nivel: nivelId }, token!);
      } else {
        await crearLeccion({ nombre, orden, nivel: nivelId }, token!);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError("Error al guardar la lección. La lección ya existe. Verifique crear una lección que no exista.");
      setError("");
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
        aria-labelledby="leccion-modal-title"
      >
        <h2 id="leccion-modal-title" className="text-xl font-bold mb-4 text-[#003087]">
          {leccion ? "Editar Lección" : "Agregar Lección"}
        </h2>
        <div className="mb-4">
          <label className="block font-medium mb-1">Nombre de la Lección</label>
          <input
            type="text"
            value={nombre}
            disabled
            className="w-full border rounded px-3 py-2 bg-gray-100"
            aria-readonly="true"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="orden-leccion" className="block font-medium mb-1">
            Número de Lección
          </label>
          <input
            id="orden-leccion"
            type="number"
            value={orden}
            onChange={e => setOrden(Number(e.target.value))}
            min={1}
            required
            className="w-full border rounded px-3 py-2"
            aria-required="true"
            aria-invalid={!!error}
          />
          <small className="text-gray-500">
            Elija un número de lección no repetido. Ejemplo: 1, 2, 3...
          </small>
        </div>
        {error && <div className="text-red-600 mb-2" role="alert">{error}</div>}
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