"use client";

import { useState, useEffect } from "react";
import { crearNivel, editarNivel } from "@/services/cursos";

interface NivelFormModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  cursoId: string;
  nivel?: { id: string; nombre: string; orden: number };
  nivelesExistentes?: { id: string; nombre: string; orden: number }[]; // Debes pasar los niveles existentes
}

export default function NivelFormModal({
  open,
  onClose,
  onSuccess,
  cursoId,
  nivel,
  nivelesExistentes = [],
}: NivelFormModalProps) {
  // Solo se edita el número (orden), el nombre es fijo
  const [orden, setOrden] = useState(nivel?.orden || 1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Generar nombre automáticamente
  const nombre = `Nivel ${orden}`;

  useEffect(() => {
    setOrden(nivel?.orden || 1);
    setError("");
  }, [nivel, open]);

  // Obtener los números de nivel ya usados (excepto el actual si está editando)
  const ordenesUsados = nivelesExistentes
    .filter(n => !nivel || n.id !== nivel.id)
    .map(n => n.orden);

  // Validar antes de enviar
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (orden < 1) {
      setError("El número de nivel debe ser mayor o igual a 1.");
      return;
    }
    if (ordenesUsados.includes(orden)) {
      setError(`Ya existe un Nivel ${orden}. Elija otro número.`);
      return;
    }
    setLoading(true);
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
      setError("Error al guardar el nivel. El nivel ya existe. Verifique crear un nivel que no exista.");
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
        aria-labelledby="nivel-modal-title"
      >
        <h2 id="nivel-modal-title" className="text-xl font-bold mb-4 text-[#003087]">
          {nivel ? "Editar Nivel" : "Agregar Nivel"}
        </h2>
        <div className="mb-4">
          <label className="block font-medium mb-1">Nombre del Nivel</label>
          <input
            type="text"
            value={nombre}
            disabled
            className="w-full border rounded px-3 py-2 bg-gray-100"
            aria-readonly="true"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="orden-nivel" className="block font-medium mb-1">
            Número de Nivel
          </label>
          <input
            id="orden-nivel"
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
            Elija un número de nivel no repetido. Ejemplo: 1, 2, 3...
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
            {nivel ? "Guardar Cambios" : "Crear Nivel"}
          </button>
        </div>
      </form>
    </div>
  );
}