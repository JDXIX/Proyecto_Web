"use client";

import { useEffect, useState } from "react";
import { getCursos, crearCurso, editarCurso, eliminarCurso } from "@/services/cursos";
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
  const [tipoMensajeGeneral, setTipoMensajeGeneral] = useState<"success" | "error" | "">("");

  // Obtener docentes activos
  const docentes = usuarios.filter(
    (u) => (u.rol?.toLowerCase() === "docente") && (u.estado === "Activo" || u.is_active)
  );

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      getUsuarioActual(token)
        .then(userData => setUser(userData))
        .catch(() => {})
        .finally(() => setLoading(false));

      getUsuarios(token)
        .then(data => setUsuarios(data))
        .catch(() => {});

      getCursos(token)
        .then(data => setCursos(data))
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setNuevoCurso({
      ...nuevoCurso,
      [e.target.name]: e.target.name === "umbral_nota" ? Number(e.target.value) : e.target.value,
    });
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (cursoEnEdicion) {
      setCursoEnEdicion({
        ...cursoEnEdicion,
        [e.target.name]: e.target.name === "umbral_nota" ? Number(e.target.value) : e.target.value,
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
      setNuevoCurso({ nombre: "", descripcion: "", docente: "", umbral_nota: 70 });
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
      const cursoEditado = await editarCurso(cursoEnEdicion.id, cursoEnEdicion, token);
      setCursos(cursos.map((c) => c.id === cursoEditado.id ? cursoEditado : c));
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
    return <div className="flex items-center justify-center min-h-screen">
      <div className="text-xl font-semibold">Cargando...</div>
    </div>;
  }

  return (
    <ProtectedRoute allowedRoles={["admin", "administrador"]} user={user}>
      <div className="p-8 w-full max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-[#003087] mb-6">Gestión de Cursos</h1>
        {mensaje && (
          <div className={`mb-4 p-3 rounded ${
            tipoMensajeGeneral === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}>
            {mensaje}
          </div>
        )}
        <div className="flex items-center justify-between mb-4">
          <button
            className="bg-[#00B7EB] text-white px-4 py-2 rounded font-semibold hover:bg-[#009fc2] transition"
            onClick={() => setShowModal(true)}
          >
            Crear curso
          </button>
        </div>
        <div className="overflow-x-auto rounded shadow mb-6">
          <table className="min-w-full bg-white border border-[#D3D3D3]">
            <thead>
              <tr className="bg-[#F4F8FB] text-[#003087]">
                <th className="py-2 px-4 border-b">ID</th>
                <th className="py-2 px-4 border-b">Nombre</th>
                <th className="py-2 px-4 border-b">Descripción</th>
                <th className="py-2 px-4 border-b">Docente</th>
                <th className="py-2 px-4 border-b">Umbral Nota (%)</th>
                <th className="py-2 px-4 border-b">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cursos.map((c) => (
                <tr key={c.id} className="hover:bg-[#F4F8FB]">
                  <td className="py-2 px-4 border-b">{c.id}</td>
                  <td className="py-2 px-4 border-b">{c.nombre}</td>
                  <td className="py-2 px-4 border-b">{c.descripcion}</td>
                  <td className="py-2 px-4 border-b">
                    {usuarios.find((u) => u.id === c.docente)?.first_name || c.docente}
                  </td>
                  <td className="py-2 px-4 border-b">{c.umbral_nota}</td>
                  <td className="py-2 px-4 border-b">
                    <button
                      className="text-[#00B7EB] hover:underline mr-2"
                      onClick={() => handleEditarCurso(c)}
                    >
                      Editar
                    </button>
                    <button
                      className="text-[#DC2626] hover:underline"
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

        {/* Modal para crear curso */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
              <h3 className="text-xl font-bold mb-4 text-[#003087]">Crear nuevo curso</h3>
              <form onSubmit={handleCrearCurso} className="space-y-4">
                <div>
                  <label className="block font-semibold mb-1">Nombre</label>
                  <input
                    type="text"
                    name="nombre"
                    value={nuevoCurso.nombre}
                    onChange={handleInputChange}
                    className="w-full border border-[#D3D3D3] rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00B7EB]"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Descripción</label>
                  <input
                    type="text"
                    name="descripcion"
                    value={nuevoCurso.descripcion}
                    onChange={handleInputChange}
                    className="w-full border border-[#D3D3D3] rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00B7EB]"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Docente</label>
                  <select
                    name="docente"
                    value={nuevoCurso.docente}
                    onChange={handleInputChange}
                    className="w-full border border-[#D3D3D3] rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00B7EB]"
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
                  <label className="block font-semibold mb-1">Umbral Nota (%)</label>
                  <input
                    type="number"
                    name="umbral_nota"
                    value={nuevoCurso.umbral_nota}
                    min={0}
                    max={100}
                    onChange={handleInputChange}
                    className="w-full border border-[#D3D3D3] rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00B7EB]"
                    required
                  />
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    type="button"
                    className="px-4 py-2 rounded bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300"
                    onClick={() => setShowModal(false)}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded bg-[#003087] text-white font-semibold hover:bg-[#002060]"
                  >
                    Crear
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal para editar curso */}
        {showEditModal && cursoEnEdicion && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
              <h3 className="text-xl font-bold mb-4 text-[#003087]">Editar curso</h3>
              <form onSubmit={handleGuardarEdicionCurso} className="space-y-4">
                <div>
                  <label className="block font-semibold mb-1">Nombre</label>
                  <input
                    type="text"
                    name="nombre"
                    value={cursoEnEdicion.nombre}
                    onChange={handleEditInputChange}
                    className="w-full border border-[#D3D3D3] rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00B7EB]"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Descripción</label>
                  <input
                    type="text"
                    name="descripcion"
                    value={cursoEnEdicion.descripcion}
                    onChange={handleEditInputChange}
                    className="w-full border border-[#D3D3D3] rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00B7EB]"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Docente</label>
                  <select
                    name="docente"
                    value={cursoEnEdicion.docente}
                    onChange={handleEditInputChange}
                    className="w-full border border-[#D3D3D3] rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00B7EB]"
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
                  <label className="block font-semibold mb-1">Umbral Nota (%)</label>
                  <input
                    type="number"
                    name="umbral_nota"
                    value={cursoEnEdicion.umbral_nota}
                    min={0}
                    max={100}
                    onChange={handleEditInputChange}
                    className="w-full border border-[#D3D3D3] rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00B7EB]"
                    required
                  />
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    type="button"
                    className="px-4 py-2 rounded bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300"
                    onClick={() => {
                      setCursoEnEdicion(null);
                      setShowEditModal(false);
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded bg-[#003087] text-white font-semibold hover:bg-[#002060]"
                  >
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