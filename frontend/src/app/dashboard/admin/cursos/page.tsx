"use client";

import { useEffect, useState } from "react";
import {
  getCursos,
  crearCurso,
  editarCurso,
  eliminarCurso,
} from "@/services/cursos";
import { getUsuarios, getUsuarioActual } from "@/services/usuarios";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function CursosPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [cursos, setCursos] = useState<any[]>([]);
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [nuevoCurso, setNuevoCurso] = useState({
    nombre: "",
    descripcion: "",
    docente: "",
    umbral_nota: 70,
  });

  const [cursoEnEdicion, setCursoEnEdicion] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const [mensaje, setMensaje] = useState("");
  const [tipoMensajeGeneral, setTipoMensajeGeneral] = useState<
    "success" | "error" | ""
  >("");

  // Obtener docentes activos
  const docentes = usuarios.filter(
    (u) =>
      u.rol?.toLowerCase() === "docente" &&
      (u.estado === "Activo" || u.is_active)
  );

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      getUsuarioActual(token)
        .then((userData) => setUser(userData))
        .catch(() => {})
        .finally(() => setLoading(false));

      getUsuarios(token)
        .then((data) => setUsuarios(data))
        .catch(() => {});

      getCursos(token)
        .then((data) => setCursos(data))
        .catch(() => {});
    } else {
      setLoading(false);
    }
  }, []);

  // Cuando se abre el modal, asigna el primer docente disponible si no hay uno seleccionado
  useEffect(() => {
    if (showModal && docentes.length > 0 && !nuevoCurso.docente) {
      setNuevoCurso((prev) => ({ ...prev, docente: docentes[0].id }));
    }
    // eslint-disable-next-line
  }, [showModal, docentes.length]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setNuevoCurso({
      ...nuevoCurso,
      [e.target.name]:
        e.target.name === "umbral_nota"
          ? Number(e.target.value)
          : e.target.value,
    });
  };

  const handleEditInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    if (cursoEnEdicion) {
      setCursoEnEdicion({
        ...cursoEnEdicion,
        [e.target.name]:
          e.target.name === "umbral_nota"
            ? Number(e.target.value)
            : e.target.value,
      });
    }
  };

  const handleCrearCurso = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoCurso.nombre || !nuevoCurso.docente) {
      setMensaje("El nombre y el docente son obligatorios");
      setTipoMensajeGeneral("error");
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) {
      setMensaje("No estás autenticado");
      setTipoMensajeGeneral("error");
      return;
    }
    try {
      const cursoCreado = await crearCurso(nuevoCurso, token);
      setCursos([...cursos, cursoCreado]);
      setNuevoCurso({
        nombre: "",
        descripcion: "",
        docente: "",
        umbral_nota: 70,
      });
      setShowModal(false);
      setMensaje("Curso creado correctamente");
      setTipoMensajeGeneral("success");
      setTimeout(() => {
        setMensaje("");
        setTipoMensajeGeneral("");
      }, 3000);
    } catch (error: any) {
      setMensaje(error.response?.data?.message || "Error al crear curso");
      setTipoMensajeGeneral("error");
    }
  };

  const handleEliminarCurso = async (id: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar este curso?")) {
      const token = localStorage.getItem("token");
      if (!token) {
        setMensaje("No estás autenticado");
        setTipoMensajeGeneral("error");
        return;
      }
      try {
        await eliminarCurso(id, token);
        setCursos(cursos.filter((c) => c.id !== id));
        setMensaje("Curso eliminado correctamente");
        setTipoMensajeGeneral("success");
        setTimeout(() => {
          setMensaje("");
          setTipoMensajeGeneral("");
        }, 3000);
      } catch (error: any) {
        setMensaje(error.response?.data?.message || "Error al eliminar curso");
        setTipoMensajeGeneral("error");
      }
    }
  };

  const handleEditarCurso = (curso: any) => {
    setCursoEnEdicion(curso);
    setShowEditModal(true);
  };

  const handleGuardarEdicionCurso = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cursoEnEdicion || !cursoEnEdicion.nombre || !cursoEnEdicion.docente) {
      setMensaje("El nombre y el docente son obligatorios");
      setTipoMensajeGeneral("error");
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) {
      setMensaje("No estás autenticado");
      setTipoMensajeGeneral("error");
      return;
    }
    try {
      const cursoEditado = await editarCurso(
        cursoEnEdicion.id,
        cursoEnEdicion,
        token
      );
      setCursos(
        cursos.map((c) => (c.id === cursoEditado.id ? cursoEditado : c))
      );
      setCursoEnEdicion(null);
      setShowEditModal(false);
      setMensaje("Curso actualizado correctamente");
      setTipoMensajeGeneral("success");
      setTimeout(() => {
        setMensaje("");
        setTipoMensajeGeneral("");
      }, 3000);
    } catch (error: any) {
      setMensaje(error.response?.data?.message || "Error al editar curso");
      setTipoMensajeGeneral("error");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--color-bg)]">
        <div className="text-lg md:text-xl font-semibold text-[var(--color-text)]">
          Cargando...
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["admin", "administrador"]} user={user}>
      <div className="w-full h-full px-4 md:px-8 py-6 md:py-8 max-w-6xl mx-auto space-y-6">
        {/* HEADER: título + botón */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="title mb-1">Gestión de Cursos</h1>
            <p className="text-sm text-[var(--color-text-light)]">
              Crea, actualiza y administra los cursos activos de la plataforma.
            </p>
          </div>
          <button
            className="btn-primary"
            onClick={() => setShowModal(true)}
          >
            Crear curso
          </button>
        </div>

        {/* MENSAJE / ALERTA */}
        {mensaje && (
          <div
            className={`mb-2 p-3 rounded-lg border text-sm ${
              tipoMensajeGeneral === "success"
                ? "bg-green-50 text-green-700 border-green-300"
                : "bg-red-50 text-red-700 border-red-300"
            }`}
          >
            {mensaje}
          </div>
        )}

        {/* TABLA */}
        <div className="bg-white rounded-2xl shadow-sm border border-[var(--color-border)] overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-[#F6F7FB] text-[var(--color-text)] border-b border-[var(--color-border)]">
              <tr>
                <th className="py-3 px-4 text-left text-sm font-medium">ID</th>
                <th className="py-3 px-4 text-left text-sm font-medium">
                  Nombre
                </th>
                <th className="py-3 px-4 text-left text-sm font-medium">
                  Descripción
                </th>
                <th className="py-3 px-4 text-left text-sm font-medium">
                  Docente
                </th>
                <th className="py-3 px-4 text-left text-sm font-medium">
                  Umbral Nota (%)
                </th>
                <th className="py-3 px-4 text-left text-sm font-medium">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {cursos.map((c) => (
                <tr
                  key={c.id}
                  className="hover:bg-[var(--color-bg)] transition border-b border-[var(--color-border)]"
                >
                  <td className="py-2 px-4 text-xs text-[var(--color-text-light)]">
                    {c.id}
                  </td>
                  <td className="py-2 px-4 text-sm font-medium text-[var(--color-text)]">
                    {c.nombre}
                  </td>
                  <td className="py-2 px-4 text-sm text-[var(--color-text-light)]">
                    {c.descripcion}
                  </td>
                  <td className="py-2 px-4 text-sm text-[var(--color-text)]">
                    {usuarios.find((u) => u.id === c.docente)?.first_name ||
                      c.docente}
                  </td>
                  <td className="py-2 px-4 text-sm text-[var(--color-text)]">
                    {c.umbral_nota}
                  </td>
                  <td className="py-2 px-4 text-sm">
                    <button
                      className="text-[var(--color-primary)] hover:underline mr-3"
                      onClick={() => handleEditarCurso(c)}
                    >
                      Editar
                    </button>
                    <button
                      className="text-[var(--color-error)] hover:underline"
                      onClick={() => handleEliminarCurso(c.id)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* MODAL CREAR CURSO */}
        {showModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md border border-[var(--color-border)]">
              <h3 className="text-xl font-semibold mb-4 text-[var(--color-primary)]">
                Crear nuevo curso
              </h3>
              <form onSubmit={handleCrearCurso} className="space-y-4">
                <div>
                  <label className="block font-medium mb-1">Nombre</label>
                  <input
                    type="text"
                    name="nombre"
                    value={nuevoCurso.nombre}
                    onChange={handleInputChange}
                    className="w-full border border-[var(--color-border)] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Descripción</label>
                  <input
                    type="text"
                    name="descripcion"
                    value={nuevoCurso.descripcion}
                    onChange={handleInputChange}
                    className="w-full border border-[var(--color-border)] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Docente</label>
                  <select
                    name="docente"
                    value={nuevoCurso.docente}
                    onChange={handleInputChange}
                    className="w-full border border-[var(--color-border)] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                    required
                  >
                    <option value="">Selecciona un docente</option>
                    {docentes.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.first_name || d.nombre} {d.last_name || ""}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-medium mb-1">
                    Umbral Nota (%)
                  </label>
                  <input
                    type="number"
                    name="umbral_nota"
                    value={nuevoCurso.umbral_nota}
                    min={0}
                    max={100}
                    onChange={handleInputChange}
                    className="w-full border border-[var(--color-border)] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                    required
                  />
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    type="button"
                    className="btn-ghost"
                    onClick={() => setShowModal(false)}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="btn-primary">
                    Crear
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL EDITAR CURSO */}
        {showEditModal && cursoEnEdicion && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md border border-[var(--color-border)]">
              <h3 className="text-xl font-semibold mb-4 text-[var(--color-primary)]">
                Editar curso
              </h3>
              <form
                onSubmit={handleGuardarEdicionCurso}
                className="space-y-4"
              >
                <div>
                  <label className="block font-medium mb-1">Nombre</label>
                  <input
                    type="text"
                    name="nombre"
                    value={cursoEnEdicion.nombre}
                    onChange={handleEditInputChange}
                    className="w-full border border-[var(--color-border)] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Descripción</label>
                  <input
                    type="text"
                    name="descripcion"
                    value={cursoEnEdicion.descripcion}
                    onChange={handleEditInputChange}
                    className="w-full border border-[var(--color-border)] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Docente</label>
                  <select
                    name="docente"
                    value={cursoEnEdicion.docente}
                    onChange={handleEditInputChange}
                    className="w-full border border-[var(--color-border)] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                    required
                  >
                    <option value="">Selecciona un docente</option>
                    {docentes.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.first_name || d.nombre} {d.last_name || ""}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-medium mb-1">
                    Umbral Nota (%)
                  </label>
                  <input
                    type="number"
                    name="umbral_nota"
                    value={cursoEnEdicion.umbral_nota}
                    min={0}
                    max={100}
                    onChange={handleEditInputChange}
                    className="w-full border border-[var(--color-border)] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                    required
                  />
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    type="button"
                    className="btn-ghost"
                    onClick={() => {
                      setCursoEnEdicion(null);
                      setShowEditModal(false);
                    }}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="btn-primary">
                    Guardar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
