"use client";

import { useEffect, useState } from "react";
import {
  getUsuarios,
  crearUsuario,
  editarUsuario,
  eliminarUsuario,
  getUsuarioActual,
} from "@/services/usuarios";
import ProtectedRoute from "@/components/ProtectedRoute";

const roles = [
  { label: "Administrador", value: "admin" },
  { label: "Docente", value: "docente" },
  { label: "Estudiante", value: "estudiante" },
];

const estados = ["Activo", "Inactivo"];

export default function UsuariosPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [usuarios, setUsuarios] = useState<any[]>([]);

  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [nuevoUsuario, setNuevoUsuario] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    rol: "docente",
    estado: "Activo",
  });

  const [usuarioEnEdicion, setUsuarioEnEdicion] = useState<any>(null);

  const [mensaje, setMensaje] = useState("");
  const [tipoMensajeGeneral, setTipoMensajeGeneral] = useState<
    "success" | "error" | ""
  >("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      getUsuarioActual(token)
        .then((userData) => setUser(userData))
        .finally(() => setLoading(false));

      getUsuarios(token)
        .then((data) => setUsuarios(data))
        .catch(() => {});
    } else {
      setLoading(false);
    }
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setNuevoUsuario({ ...nuevoUsuario, [e.target.name]: e.target.value });
  };

  const handleEditInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    if (usuarioEnEdicion) {
      setUsuarioEnEdicion({
        ...usuarioEnEdicion,
        [e.target.name]: e.target.value,
      });
    }
  };

  const handleCrearUsuario = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !nuevoUsuario.first_name ||
      !nuevoUsuario.last_name ||
      !nuevoUsuario.email ||
      !nuevoUsuario.password
    ) {
      setMensaje("Todos los campos son obligatorios");
      setTipoMensajeGeneral("error");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const datosUsuario = {
        first_name: nuevoUsuario.first_name,
        last_name: nuevoUsuario.last_name,
        email: nuevoUsuario.email,
        password: nuevoUsuario.password,
        rol: nuevoUsuario.rol.toLowerCase(),
        estado: nuevoUsuario.estado,
      };

      const usuarioCreado = await crearUsuario(datosUsuario, token);

      setUsuarios([...usuarios, usuarioCreado]);
      setNuevoUsuario({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        rol: "docente",
        estado: "Activo",
      });

      setShowModal(false);
      setMensaje("Usuario creado correctamente");
      setTipoMensajeGeneral("success");

      setTimeout(() => {
        setMensaje("");
        setTipoMensajeGeneral("");
      }, 2500);
    } catch (error: any) {
      setMensaje(error.response?.data?.message || "Error al crear usuario");
      setTipoMensajeGeneral("error");
    }
  };

  const handleEliminarUsuario = async (id: string) => {
    if (!confirm("¿Deseas eliminar este usuario?")) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      await eliminarUsuario(id, token);
      setUsuarios(usuarios.filter((u) => u.id !== id));
      setMensaje("Usuario eliminado correctamente");
      setTipoMensajeGeneral("success");

      setTimeout(() => {
        setMensaje("");
        setTipoMensajeGeneral("");
      }, 2500);
    } catch (error: any) {
      setMensaje(error.response?.data?.message || "Error al eliminar usuario");
      setTipoMensajeGeneral("error");
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
      estado:
        usuario.estado !== undefined
          ? usuario.estado
          : usuario.is_active
          ? "Activo"
          : "Inactivo",
    };

    setUsuarioEnEdicion(usuarioFormateado);
    setShowEditModal(true);
  };

  const handleGuardarEdicionUsuario = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!usuarioEnEdicion.first_name || !usuarioEnEdicion.email) {
      setMensaje("Nombre y correo son obligatorios");
      setTipoMensajeGeneral("error");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const datosEditados = {
        ...usuarioEnEdicion,
        rol: usuarioEnEdicion.rol.toLowerCase(),
      };

      if (!datosEditados.password) delete datosEditados.password;

      const usuarioEditado = await editarUsuario(
        usuarioEnEdicion.id,
        datosEditados,
        token
      );

      setUsuarios(
        usuarios.map((u) => (u.id === usuarioEditado.id ? usuarioEditado : u))
      );

      setShowEditModal(false);
      setUsuarioEnEdicion(null);

      setMensaje("Usuario actualizado correctamente");
      setTipoMensajeGeneral("success");

      setTimeout(() => {
        setMensaje("");
        setTipoMensajeGeneral("");
      }, 2500);
    } catch (error: any) {
      setMensaje(error.response?.data?.message || "Error al editar usuario");
      setTipoMensajeGeneral("error");
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--color-bg)]">
        <div className="text-lg md:text-xl font-semibold text-[var(--color-text)]">
          Cargando...
        </div>
      </div>
    );

  return (
    <ProtectedRoute allowedRoles={["admin", "administrador"]} user={user}>
      <div className="w-full h-full px-4 md:px-8 py-6 md:py-8 max-w-6xl mx-auto space-y-6">
        {/* HEADER: título + botón */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="title mb-1">Gestión de Usuarios</h1>
            <p className="text-sm text-[var(--color-text-light)]">
              Administra cuentas, roles y estados de acceso al sistema.
            </p>
          </div>
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            Crear usuario
          </button>
        </div>

        {/* ALERTAS */}
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
        <div className="bg-white rounded-2xl shadow-sm border border-[var(--color-border)] overflow-hidden">
          <table className="min-w-full bg-white">
            <thead className="bg-[#F6F7FB] text-[var(--color-text)] border-b border-[var(--color-border)]">
              <tr>
                <th className="py-3 px-4 text-left text-sm font-medium">Nombre</th>
                <th className="py-3 px-4 text-left text-sm font-medium">Correo</th>
                <th className="py-3 px-4 text-left text-sm font-medium">Rol</th>
                <th className="py-3 px-4 text-left text-sm font-medium">Estado</th>
                <th className="py-3 px-4 text-left text-sm font-medium">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {usuarios.map((u) => (
                <tr
                  key={u.id}
                  className="hover:bg-[var(--color-bg)] transition border-b border-[var(--color-border)]"
                >
                  <td className="py-3 px-4 text-sm text-[var(--color-text)]">
                    {u.first_name || u.nombre} {u.last_name}
                  </td>

                  <td className="py-3 px-4 text-sm text-[var(--color-text-light)]">
                    {u.email}
                  </td>

                  <td className="py-3 px-4 text-sm">
                    <span className="px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-700">
                      {u.rol}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-sm">
                    <span
                      className={`px-3 py-1 text-xs rounded-full ${
                        u.estado === "Activo" || u.is_active
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {u.estado ?? (u.is_active ? "Activo" : "Inactivo")}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-sm">
                    <button
                      className="text-[var(--color-primary)] hover:underline mr-3"
                      onClick={() => handleEditarUsuario(u)}
                    >
                      Editar
                    </button>
                    <button
                      className="text-[var(--color-error)] hover:underline"
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

        {/* MODAL CREAR USUARIO */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="card p-8 w-full max-w-md">
              <h3 className="text-xl font-semibold text-[var(--color-text)] mb-4">
                Crear nuevo usuario
              </h3>

              <form onSubmit={handleCrearUsuario} className="space-y-4">
                <div>
                  <label className="block font-medium mb-1">Nombre</label>
                  <input
                    type="text"
                    name="first_name"
                    value={nuevoUsuario.first_name}
                    onChange={handleInputChange}
                    className="w-full border rounded-lg px-3 py-2 border-[var(--color-border)] focus:ring-2 focus:ring-[var(--color-primary)]"
                    required
                  />
                </div>

                <div>
                  <label className="block font-medium mb-1">Apellido</label>
                  <input
                    type="text"
                    name="last_name"
                    value={nuevoUsuario.last_name}
                    onChange={handleInputChange}
                    className="w-full border rounded-lg px-3 py-2 border-[var(--color-border)] focus:ring-2 focus:ring-[var(--color-primary)]"
                    required
                  />
                </div>

                <div>
                  <label className="block font-medium mb-1">
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={nuevoUsuario.email}
                    onChange={handleInputChange}
                    className="w-full border rounded-lg px-3 py-2 border-[var(--color-border)] focus:ring-2 focus:ring-[var(--color-primary)]"
                    required
                  />
                </div>

                <div>
                  <label className="block font-medium mb-1">Contraseña</label>
                  <input
                    type="password"
                    name="password"
                    value={nuevoUsuario.password}
                    onChange={handleInputChange}
                    className="w-full border rounded-lg px-3 py-2 border-[var(--color-border)] focus:ring-2 focus:ring-[var(--color-primary)]"
                    required
                  />
                </div>

                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block font-medium mb-1">Rol</label>
                    <select
                      name="rol"
                      value={nuevoUsuario.rol}
                      onChange={handleInputChange}
                      className="w-full border rounded-lg px-3 py-2 border-[var(--color-border)] focus:ring-2 focus:ring-[var(--color-primary)]"
                    >
                      {roles.map((rol) => (
                        <option key={rol.value} value={rol.value}>
                          {rol.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex-1">
                    <label className="block font-medium mb-1">Estado</label>
                    <select
                      name="estado"
                      value={nuevoUsuario.estado}
                      onChange={handleInputChange}
                      className="w-full border rounded-lg px-3 py-2 border-[var(--color-border)] focus:ring-2 focus:ring-[var(--color-primary)]"
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

        {/* MODAL EDITAR USUARIO */}
        {showEditModal && usuarioEnEdicion && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="card p-8 w-full max-w-md">
              <h3 className="text-xl font-semibold text-[var(--color-text)] mb-4">
                Editar usuario
              </h3>

              <form onSubmit={handleGuardarEdicionUsuario} className="space-y-4">
                <div>
                  <label className="block font-medium mb-1">Nombre</label>
                  <input
                    type="text"
                    name="first_name"
                    value={usuarioEnEdicion.first_name}
                    onChange={handleEditInputChange}
                    className="w-full border rounded-lg px-3 py-2 border-[var(--color-border)] focus:ring-2 focus:ring-[var(--color-primary)]"
                    required
                  />
                </div>

                <div>
                  <label className="block font-medium mb-1">Apellido</label>
                  <input
                    type="text"
                    name="last_name"
                    value={usuarioEnEdicion.last_name}
                    onChange={handleEditInputChange}
                    className="w-full border rounded-lg px-3 py-2 border-[var(--color-border)] focus:ring-2 focus:ring-[var(--color-primary)]"
                  />
                </div>

                <div>
                  <label className="block font-medium mb-1">
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={usuarioEnEdicion.email}
                    onChange={handleEditInputChange}
                    className="w-full border rounded-lg px-3 py-2 border-[var(--color-border)] focus:ring-2 focus:ring-[var(--color-primary)]"
                    required
                  />
                </div>

                <div>
                  <label className="block font-medium mb-1">
                    Contraseña (dejar vacío para no cambiar)
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={usuarioEnEdicion.password || ""}
                    onChange={handleEditInputChange}
                    className="w-full border rounded-lg px-3 py-2 border-[var(--color-border)] focus:ring-2 focus:ring-[var(--color-primary)]"
                  />
                </div>

                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block font-medium mb-1">Rol</label>
                    <select
                      name="rol"
                      value={usuarioEnEdicion.rol}
                      onChange={handleEditInputChange}
                      className="w-full border rounded-lg px-3 py-2 border-[var(--color-border)] focus:ring-2 focus:ring-[var(--color-primary)]"
                    >
                      {roles.map((rol) => (
                        <option key={rol.value} value={rol.value}>
                          {rol.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex-1">
                    <label className="block font-medium mb-1">Estado</label>
                    <select
                      name="estado"
                      value={usuarioEnEdicion.estado}
                      onChange={handleEditInputChange}
                      className="w-full border rounded-lg px-3 py-2 border-[var(--color-border)] focus:ring-2 focus:ring-[var(--color-primary)]"
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
                    className="btn-ghost"
                    onClick={() => {
                      setUsuarioEnEdicion(null);
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
