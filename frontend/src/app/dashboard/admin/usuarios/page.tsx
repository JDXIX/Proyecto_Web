"use client";

import { useEffect, useState } from "react";
import { getUsuarios, crearUsuario, editarUsuario, eliminarUsuario, getUsuarioActual } from "@/services/usuarios";
import ProtectedRoute from "@/components/ProtectedRoute";

const roles = [
  { label: "Administrador", value: "admin" },
  { label: "Docente", value: "docente" },
  { label: "Estudiante", value: "estudiante" }
];

const estados = ["Activo", "Inactivo"];

export default function UsuariosPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [nuevoUsuario, setNuevoUsuario] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    rol: "docente",
    estado: "Activo",
  });

  const [usuarioEnEdicion, setUsuarioEnEdicion] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const [mensaje, setMensaje] = useState("");
  const [tipoMensajeGeneral, setTipoMensajeGeneral] = useState<"success" | "error" | "">("");

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
    } else {
      setLoading(false);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setNuevoUsuario({ ...nuevoUsuario, [e.target.name]: e.target.value });
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (usuarioEnEdicion) {
      setUsuarioEnEdicion({
        ...usuarioEnEdicion,
        [e.target.name]: e.target.value
      });
    }
  };

  const handleCrearUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoUsuario.first_name || !nuevoUsuario.last_name || !nuevoUsuario.email || !nuevoUsuario.password) {
      setMensaje("Todos los campos son obligatorios");
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
      const datosUsuario = {
        first_name: nuevoUsuario.first_name,
        last_name: nuevoUsuario.last_name,
        email: nuevoUsuario.email,
        password: nuevoUsuario.password,
        rol: nuevoUsuario.rol.toLowerCase(),
        estado: nuevoUsuario.estado
      };
      const usuarioCreado = await crearUsuario(datosUsuario, token);
      setUsuarios([...usuarios, usuarioCreado]);
      setNuevoUsuario({ first_name: "", last_name: "", email: "", password: "", rol: "docente", estado: "Activo" });
      setShowModal(false);
      setMensaje("Usuario creado correctamente");
      setTipoMensajeGeneral("success");
      setTimeout(() => {
        setMensaje("");
        setTipoMensajeGeneral("");
      }, 3000);
    } catch (error: any) {
      setMensaje(error.response?.data?.message || "Error al crear usuario");
      setTipoMensajeGeneral("error");
    }
  };

  const handleEliminarUsuario = async (id: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar este usuario?")) {
      const token = localStorage.getItem("token");
      if (!token) {
        setMensaje("No estás autenticado");
        setTipoMensajeGeneral("error");
        return;
      }
      try {
        await eliminarUsuario(id, token);
        setUsuarios(usuarios.filter(u => u.id !== id));
        setMensaje("Usuario eliminado correctamente");
        setTipoMensajeGeneral("success");
        setTimeout(() => {
          setMensaje("");
          setTipoMensajeGeneral("");
        }, 3000);
      } catch (error: any) {
        setMensaje(error.response?.data?.message || "Error al eliminar usuario");
        setTipoMensajeGeneral("error");
      }
    }
  };

  const handleEditarUsuario = (usuario: any) => {
    const usuarioFormateado = {
      id: usuario.id,
      first_name: usuario.first_name || usuario.nombre || "",
      last_name: usuario.last_name || "",
      email: usuario.email || "",
      password: "",
      rol: usuario.rol?.toLowerCase() || "docente",
      estado: usuario.estado || (usuario.is_active ? "Activo" : "Inactivo")
    };
    setUsuarioEnEdicion(usuarioFormateado);
    setShowEditModal(true);
  };

  const handleGuardarEdicionUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuarioEnEdicion || !usuarioEnEdicion.first_name || !usuarioEnEdicion.email) {
      setMensaje("Nombre y correo son obligatorios");
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
      const datosEditados = {
        ...usuarioEnEdicion,
        rol: usuarioEnEdicion.rol.toLowerCase()
      };
      if (!datosEditados.password) {
        delete datosEditados.password;
      }
      const usuarioEditado = await editarUsuario(usuarioEnEdicion.id, datosEditados, token);
      setUsuarios(usuarios.map(u => u.id === usuarioEditado.id ? usuarioEditado : u));
      setUsuarioEnEdicion(null);
      setShowEditModal(false);
      setMensaje("Usuario actualizado correctamente");
      setTipoMensajeGeneral("success");
      setTimeout(() => {
        setMensaje("");
        setTipoMensajeGeneral("");
      }, 3000);
    } catch (error: any) {
      setMensaje(error.response?.data?.message || "Error al editar usuario");
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
        <h1 className="text-2xl font-bold text-[#003087] mb-6">Gestión de Usuarios</h1>
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
            Crear usuario
          </button>
        </div>
        <div className="overflow-x-auto rounded shadow">
          <table className="min-w-full bg-white border border-[#D3D3D3]">
            <thead>
              <tr className="bg-[#F4F8FB] text-[#003087]">
                <th className="py-2 px-4 border-b">Nombre</th>
                <th className="py-2 px-4 border-b">Correo</th>
                <th className="py-2 px-4 border-b">Rol</th>
                <th className="py-2 px-4 border-b">Estado</th>
                <th className="py-2 px-4 border-b">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => (
                <tr key={u.id} className="hover:bg-[#F4F8FB]">
                  <td className="py-2 px-4 border-b">{u.first_name || u.nombre} {u.last_name || ""}</td>
                  <td className="py-2 px-4 border-b">{u.email}</td>
                  <td className="py-2 px-4 border-b">{u.rol}</td>
                  <td className="py-2 px-4 border-b">{u.estado !== undefined ? u.estado : (u.is_active ? "Activo" : "Inactivo")}</td>
                  <td className="py-2 px-4 border-b">
                    <button
                      className="text-[#00B7EB] hover:underline mr-2"
                      onClick={() => handleEditarUsuario(u)}
                    >
                      Editar
                    </button>
                    <button
                      className="text-[#DC2626] hover:underline"
                      onClick={() => handleEliminarUsuario(u.id)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal para crear usuario */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
              <h3 className="text-xl font-bold mb-4 text-[#003087]">Crear nuevo usuario</h3>
              <form onSubmit={handleCrearUsuario} className="space-y-4">
                <div>
                  <label className="block font-semibold mb-1">Nombre</label>
                  <input
                    type="text"
                    name="first_name"
                    value={nuevoUsuario.first_name}
                    onChange={handleInputChange}
                    className="w-full border border-[#D3D3D3] rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00B7EB]"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Apellido</label>
                  <input
                    type="text"
                    name="last_name"
                    value={nuevoUsuario.last_name}
                    onChange={handleInputChange}
                    className="w-full border border-[#D3D3D3] rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00B7EB]"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Correo electrónico</label>
                  <input
                    type="email"
                    name="email"
                    value={nuevoUsuario.email}
                    onChange={handleInputChange}
                    className="w-full border border-[#D3D3D3] rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00B7EB]"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Contraseña</label>
                  <input
                    type="password"
                    name="password"
                    value={nuevoUsuario.password}
                    onChange={handleInputChange}
                    className="w-full border border-[#D3D3D3] rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00B7EB]"
                    required
                  />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block font-semibold mb-1">Rol</label>
                    <select
                      name="rol"
                      value={nuevoUsuario.rol}
                      onChange={handleInputChange}
                      className="w-full border border-[#D3D3D3] rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00B7EB]"
                    >
                      {roles.map((rol) => (
                        <option key={rol.value} value={rol.value}>
                          {rol.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="block font-semibold mb-1">Estado</label>
                    <select
                      name="estado"
                      value={nuevoUsuario.estado}
                      onChange={handleInputChange}
                      className="w-full border border-[#D3D3D3] rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00B7EB]"
                    >
                      {estados.map((estado) => (
                        <option key={estado} value={estado}>
                          {estado}
                        </option>
                      ))}
                    </select>
                  </div>
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

        {/* Modal para editar usuario */}
        {showEditModal && usuarioEnEdicion && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
              <h3 className="text-xl font-bold mb-4 text-[#003087]">Editar usuario</h3>
              <form onSubmit={handleGuardarEdicionUsuario} className="space-y-4">
                <div>
                  <label className="block font-semibold mb-1">Nombre</label>
                  <input
                    type="text"
                    name="first_name"
                    value={usuarioEnEdicion.first_name}
                    onChange={handleEditInputChange}
                    className="w-full border border-[#D3D3D3] rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00B7EB]"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Apellido</label>
                  <input
                    type="text"
                    name="last_name"
                    value={usuarioEnEdicion.last_name || ""}
                    onChange={handleEditInputChange}
                    className="w-full border border-[#D3D3D3] rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00B7EB]"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Correo electrónico</label>
                  <input
                    type="email"
                    name="email"
                    value={usuarioEnEdicion.email}
                    onChange={handleEditInputChange}
                    className="w-full border border-[#D3D3D3] rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00B7EB]"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Contraseña (dejar vacío para no cambiar)</label>
                  <input
                    type="password"
                    name="password"
                    value={usuarioEnEdicion.password || ""}
                    onChange={handleEditInputChange}
                    className="w-full border border-[#D3D3D3] rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00B7EB]"
                    autoComplete="new-password"
                  />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block font-semibold mb-1">Rol</label>
                    <select
                      name="rol"
                      value={usuarioEnEdicion.rol}
                      onChange={handleEditInputChange}
                      className="w-full border border-[#D3D3D3] rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00B7EB]"
                    >
                      {roles.map((rol) => (
                        <option key={rol.value} value={rol.value}>
                          {rol.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="block font-semibold mb-1">Estado</label>
                    <select
                      name="estado"
                      value={usuarioEnEdicion.estado}
                      onChange={handleEditInputChange}
                      className="w-full border border-[#D3D3D3] rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00B7EB]"
                    >
                      {estados.map((estado) => (
                        <option key={estado} value={estado}>
                          {estado}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    type="button"
                    className="px-4 py-2 rounded bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300"
                    onClick={() => {
                      setUsuarioEnEdicion(null);
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