"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { crearRecurso, editarRecurso } from "@/services/cursos";
import { crearSesionesMonitoreo } from "@/services/monitoreo";

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
    duracion?: number;
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
const TIPOS_INFORMATIVOS = ["video", "pdf", "archivo"]; // Video/PDF/Archivo son informativos

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
  const [duracion, setDuracion] = useState<number | "">(recurso?.duracion || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [recursoGuardado, setRecursoGuardado] = useState<any>(null);
  const [creandoSesiones, setCreandoSesiones] = useState(false);
  const [sesionesMensaje, setSesionesMensaje] = useState<string | null>(null);

  // ISO: Estado para mostrar confirmación antes de crear recurso evaluable
  const [mostrarConfirmacionISO, setMostrarConfirmacionISO] = useState(false);
  // Estado para mostrar el modal de crear sesión monitoreo
  const [mostrarModalSesion, setMostrarModalSesion] = useState(false);

  useEffect(() => {
    setNombre(recurso?.nombre || "");
    setTipo(recurso?.tipo || "video");
    setEsEvaluable(recurso?.es_evaluable || false);
    setPermiteMonitoreo(recurso?.permite_monitoreo ?? true);
    setDuracion(recurso?.duracion || "");
    setArchivo(null);
    setError("");
    setRecursoGuardado(null);
    setSesionesMensaje(null);
    setMostrarConfirmacionISO(false);
    setMostrarModalSesion(false);
    setCreandoSesiones(false);
  }, [recurso, open]);

  useEffect(() => {
    // Si el tipo no permite monitoreo, desmarca monitoreo
    setPermiteMonitoreo(!NO_MONITOREO.includes(tipo));
    // Si el tipo es informativo, fuerza no-evaluable
    if (TIPOS_INFORMATIVOS.includes(tipo)) {
      setEsEvaluable(false);
    }
  }, [tipo]);

  // Si el usuario marca "Es evaluable", fuerza "Permite monitoreo"
  useEffect(() => {
    if (es_evaluable) setPermiteMonitoreo(true);
  }, [es_evaluable]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setArchivo(e.target.files[0]);
    }
  };

  // Validación de duración para cualquier recurso con monitoreo
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setRecursoGuardado(null);
    setSesionesMensaje(null);

    if (permite_monitoreo && (!duracion || Number(duracion) <= 0)) {
      setError("Debe especificar la duración (en segundos) para recursos con monitoreo.");
      return;
    }

    if (!recurso && es_evaluable) {
      setMostrarConfirmacionISO(true);
      return;
    }
    await crearRecursoFinal();
  };

  // ISO: Confirmar creación de recurso evaluable
  const handleConfirmarISO = async () => {
    setMostrarConfirmacionISO(false);
    await crearRecursoFinal();
  };

  // ISO: Cancelar creación de recurso evaluable
  const handleCancelarISO = () => {
    setMostrarConfirmacionISO(false);
  };

  // Lógica para crear recurso (usada por ambos flujos)
  const crearRecursoFinal = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      const formData = new FormData();
      formData.append("nombre", nombre);
      formData.append("tipo", tipo);
      formData.append("fase", leccionId);
      formData.append("es_evaluable", String(es_evaluable));
      formData.append("permite_monitoreo", String(permite_monitoreo));
      if (archivo) formData.append("archivo", archivo);
      if (duracion !== "") formData.append("duracion", String(duracion));

      let recursoResp;
      if (recurso) {
        recursoResp = await editarRecurso(recurso.id, formData, token!);
        setRecursoGuardado(recursoResp || recurso);
        onSuccess();
        onClose();
      } else {
        recursoResp = await crearRecurso(formData, token!);
        setRecursoGuardado(recursoResp);
        // Si permite monitoreo, mostrar siempre el modal para crear sesiones
        if (permite_monitoreo) {
          setMostrarModalSesion(true);
        } else {
          onSuccess();
          onClose();
        }
      }
    } catch (err: any) {
      setError("Error al guardar el recurso.");
    } finally {
      setLoading(false);
    }
  };

  // Lógica para crear sesiones monitoreo
  const handleCrearSesiones = async () => {
    if (!recursoGuardado?.id) return;
    setCreandoSesiones(true);
    setSesionesMensaje(null);
    const token = localStorage.getItem("token");
    try {
      await crearSesionesMonitoreo(
        {
          recursoId: recursoGuardado.id,
          faseId: leccionId,
        },
        token!
      );
      setSesionesMensaje(
        "Sesiones de monitoreo creadas exitosamente para todos los estudiantes."
      );
      // Cierra todos los modales después de un breve mensaje
      setTimeout(() => {
        setMostrarModalSesion(false);
        onSuccess();
        onClose();
      }, 1500);
    } catch (err: any) {
      setSesionesMensaje("Error al crear sesiones de monitoreo.");
    } finally {
      setCreandoSesiones(false);
    }
  };

  if (!open) return null;

  return (
    <>
      {/* Modal principal de formulario */}
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
              onChange={(e) => setNombre(e.target.value)}
              required
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div className="mb-4">
            <label className="block font-medium mb-1">Tipo</label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              {TIPO.map((opt) => (
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

          {/* Es evaluable: deshabilitado para Video/PDF/Archivo */}
          <div className="mb-2 flex items-center gap-2">
            <input
              type="checkbox"
              checked={es_evaluable}
              onChange={(e) => setEsEvaluable(e.target.checked)}
              id="evaluable"
              disabled={TIPOS_INFORMATIVOS.includes(tipo)}
            />
            <label htmlFor="evaluable" className="font-medium">
              Es evaluable (nota académica)
            </label>
          </div>
          {TIPOS_INFORMATIVOS.includes(tipo) && (
            <div className="mb-4 text-xs text-gray-500">
              Los tipos Video/PDF/Archivo son informativos y no pueden ser evaluables.
            </div>
          )}

          <div className="mb-4 flex items-center gap-2">
            <input
              type="checkbox"
              checked={permite_monitoreo}
              disabled={es_evaluable || NO_MONITOREO.includes(tipo)}
              onChange={(e) => setPermiteMonitoreo(e.target.checked)}
              id="permite_monitoreo"
            />
            <label htmlFor="permite_monitoreo" className="font-medium">
              Permite monitoreo
            </label>
          </div>

          {/* Campo duración para cualquier recurso con monitoreo */}
          {permite_monitoreo && (
            <div className="mb-4">
              <label className="block font-medium mb-1">
                Duración del recurso (en segundos) <span className="text-red-600">*</span>
              </label>
              <input
                type="number"
                min={1}
                value={duracion}
                onChange={(e) =>
                  setDuracion(e.target.value === "" ? "" : Number(e.target.value))
                }
                required
                className="w-full border rounded px-3 py-2"
                placeholder="Ej: 120"
              />
              <span className="text-xs text-gray-500">
                El monitoreo durará exactamente este tiempo.
              </span>
            </div>
          )}

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
        </form>
      </div>

      {/* Modal de confirmación ISO */}
      {mostrarConfirmacionISO && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-md w-full">
            <h3 className="text-lg font-bold mb-2 text-[#003087]">
              Confirmación de recurso evaluable
            </h3>
            <p className="mb-4">
              ¿Está seguro de que desea crear este recurso como <b>evaluable</b>?<br />
              Recuerde que al ser evaluable será monitoreado.
            </p>
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                onClick={handleCancelarISO}
              >
                Cancelar
              </button>
              <button
                className="px-4 py-2 rounded bg-blue-700 text-white hover:bg-blue-800"
                onClick={handleConfirmarISO}
              >
                Confirmar y crear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para crear sesión monitoreo */}
      {mostrarModalSesion && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-md w-full flex flex-col items-center">
            <h3 className="text-lg font-bold mb-2 text-[#003087]">Crear sesión de monitoreo</h3>
            <p className="mb-4 text-center">
              Este recurso requiere monitoreo de atención.<br />
              Debe crear la sesión de monitoreo para los estudiantes.<br />
              <span className="text-xs text-gray-500">Presione el botón para continuar.</span>
            </p>
            <button
              type="button"
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              onClick={handleCrearSesiones}
              disabled={creandoSesiones}
            >
              {creandoSesiones ? "Creando sesiones..." : "Crear sesión de monitoreo"}
            </button>
            {sesionesMensaje && (
              <div
                className={`mt-4 text-sm ${
                  sesionesMensaje.startsWith("Error") ? "text-red-600" : "text-green-700"
                }`}
              >
                {sesionesMensaje}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}