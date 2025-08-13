"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { crearRecurso, editarRecurso } from "@/services/cursos";
import { crearSesionesMonitoreo } from "@/services/monitoreo"; // NUEVO

interface RecursoFormModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  leccionId: string;
  recurso?: {
    id: string;
    nombre: string;
    tipo: string;
    permite_monitoreo: boolean;
    es_evaluable: boolean;
  };
}

const TIPO = [
  { value: "video", label: "Video" },
  { value: "quiz", label: "Quiz" },
  { value: "pdf", label: "PDF" },
  { value: "simulador", label: "Simulador" },
  { value: "archivo", label: "Archivo" },
];

const NO_MONITOREO = ["archivo"];

export default function RecursoFormModal({
  open,
  onClose,
  onSuccess,
  leccionId,
  recurso,
}: RecursoFormModalProps) {
  const [nombre, setNombre] = useState(recurso?.nombre || "");
  const [tipo, setTipo] = useState(recurso?.tipo || "video");
  const [archivo, setArchivo] = useState<File | null>(null);
  const [es_evaluable, setEsEvaluable] = useState(recurso?.es_evaluable || false);
  const [permite_monitoreo, setPermiteMonitoreo] = useState(
    recurso?.permite_monitoreo ?? true
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [recursoGuardado, setRecursoGuardado] = useState<any>(null);
  const [creandoSesiones, setCreandoSesiones] = useState(false);
  const [sesionesMensaje, setSesionesMensaje] = useState<string | null>(null);

  useEffect(() => {
    setNombre(recurso?.nombre || "");
    setTipo(recurso?.tipo || "video");
    setEsEvaluable(recurso?.es_evaluable || false);
    setPermiteMonitoreo(recurso?.permite_monitoreo ?? true);
    setArchivo(null);
    setError("");
    setRecursoGuardado(null);
    setSesionesMensaje(null);
  }, [recurso, open]);

  useEffect(() => {
    // Si el tipo no permite monitoreo, desmarca monitoreo
    setPermiteMonitoreo(!NO_MONITOREO.includes(tipo));
  }, [tipo]);

  // Si el usuario marca "Es evaluable", fuerza "Permite monitoreo" y lo deshabilita
  useEffect(() => {
    if (es_evaluable) setPermiteMonitoreo(true);
  }, [es_evaluable]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setArchivo(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setRecursoGuardado(null);
    setSesionesMensaje(null);
    const token = localStorage.getItem("token");
    try {
      const formData = new FormData();
      formData.append("nombre", nombre);
      formData.append("tipo", tipo);
      formData.append("fase", leccionId);
      formData.append("es_evaluable", String(es_evaluable));
      formData.append("permite_monitoreo", String(permite_monitoreo));
      if (archivo) formData.append("archivo", archivo);

      let recursoResp;
      if (recurso) {
        recursoResp = await editarRecurso(recurso.id, formData, token!);
      } else {
        recursoResp = await crearRecurso(formData, token!);
      }
      setRecursoGuardado(recursoResp || recurso); // Guarda el recurso para usar su id
      onSuccess();
      // No cerramos el modal para mostrar el botón de crear sesiones
      // onClose();
    } catch (err: any) {
      setError("Error al guardar el recurso.");
    } finally {
      setLoading(false);
    }
  };

  // Lógica para crear sesiones monitoreo
  const handleCrearSesiones = async () => {
    if (!recursoGuardado?.id && !recurso?.id) return;
    setCreandoSesiones(true);
    setSesionesMensaje(null);
    const token = localStorage.getItem("token");
    try {
      await crearSesionesMonitoreo({
        recursoId: recursoGuardado?.id || recurso?.id,
        faseId: leccionId,
        // Puedes agregar más campos si tu backend lo requiere
      }, token!);
      setSesionesMensaje("Sesiones de monitoreo creadas exitosamente para todos los estudiantes.");
    } catch (err: any) {
      setSesionesMensaje("Error al crear sesiones de monitoreo.");
    } finally {
      setCreandoSesiones(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md"
        encType="multipart/form-data"
      >
        <h2 className="text-xl font-bold mb-4 text-[#003087]">
          {recurso ? "Editar Recurso" : "Agregar Recurso"}
        </h2>
        <div className="mb-4">
          <label className="block font-medium mb-1">Nombre del Recurso</label>
          <input
            type="text"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div className="mb-4">
          <label className="block font-medium mb-1">Tipo</label>
          <select
            value={tipo}
            onChange={e => setTipo(e.target.value)}
            className="w-full border rounded px-3 py-2"
          >
            {TIPO.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block font-medium mb-1">Archivo</label>
          <input
            type="file"
            accept=".mp4,.webm,.pdf,.docx,.jpg,.png"
            onChange={handleFileChange}
            className="w-full"
          />
          <span className="text-xs text-gray-500">
            Máx. 100MB. Formatos: mp4, webm, pdf, docx, jpg, png
          </span>
        </div>
        <div className="mb-4 flex items-center gap-2">
          <input
            type="checkbox"
            checked={es_evaluable}
            onChange={e => setEsEvaluable(e.target.checked)}
            id="evaluable"
          />
          <label htmlFor="evaluable" className="font-medium">
            Es evaluable (nota académica)
          </label>
        </div>
        <div className="mb-4 flex items-center gap-2">
          <input
            type="checkbox"
            checked={permite_monitoreo}
            disabled={es_evaluable || NO_MONITOREO.includes(tipo)}
            onChange={e => setPermiteMonitoreo(e.target.checked)}
            id="permite_monitoreo"
          />
          <label htmlFor="permite_monitoreo" className="font-medium">
            Permite monitoreo
          </label>
        </div>
        {!permite_monitoreo && (
          <div className="mb-4 text-yellow-700 bg-yellow-100 px-3 py-2 rounded text-sm">
            Advertencia: Este recurso no permite monitoreo de atención.
          </div>
        )}
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
            {recurso ? "Guardar Cambios" : "Crear Recurso"}
          </button>
        </div>
        {/* Botón para crear sesiones monitoreo */}
        {(recursoGuardado?.es_evaluable || recurso?.es_evaluable) && (recursoGuardado?.permite_monitoreo || recurso?.permite_monitoreo) && (
          <div className="mt-6 flex flex-col items-center">
            <button
              type="button"
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              onClick={handleCrearSesiones}
              disabled={creandoSesiones}
            >
              {creandoSesiones ? "Creando sesiones..." : "Crear sesión monitoreo"}
            </button>
            {sesionesMensaje && (
              <div className={`mt-2 text-sm ${sesionesMensaje.startsWith("Error") ? "text-red-600" : "text-green-700"}`}>
                {sesionesMensaje}
              </div>
            )}
          </div>
        )}
      </form>
    </div>
  );
}