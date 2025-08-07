"use client";
import { useState } from "react";

const usuariosDummy = [
  { id: 1, nombre: "Ana Pérez", email: "ana@jmvision.edu", rol: "Docente", estado: "Activo" },
  { id: 2, nombre: "Juan Torres", email: "juan@jmvision.edu", rol: "Estudiante", estado: "Activo" },
  { id: 3, nombre: "Carlos Ruiz", email: "carlos@jmvision.edu", rol: "Docente", estado: "Inactivo" },
];

const roles = ["Administrador", "Docente", "Estudiante"];
const estados = ["Activo", "Inactivo"];

export default function AdminDashboard() {
  const [usuarios, setUsuarios] = useState(usuariosDummy);
  const [showModal, setShowModal] = useState(false);
  const [nuevoUsuario, setNuevoUsuario] = useState({
    nombre: "",
    email: "",
    rol: "Docente",
    estado: "Activo",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setNuevoUsuario({ ...nuevoUsuario, [e.target.name]: e.target.value });
  };

  const handleCrearUsuario = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoUsuario.nombre || !nuevoUsuario.email) return;
    setUsuarios([
      ...usuarios,
      {
        ...nuevoUsuario,
        id: usuarios.length + 1,
      },
    ]);
    setNuevoUsuario({ nombre: "", email: "", rol: "Docente", estado: "Activo" });
    setShowModal(false);
  };

  return (
    <div className="p-8 w-full max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-[#003087] mb-6">Panel de Administrador</h1>
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Gestión de Usuarios</h2>
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
                  <td className="py-2 px-4 border-b">{u.nombre}</td>
                  <td className="py-2 px-4 border-b">{u.email}</td>
                  <td className="py-2 px-4 border-b">{u.rol}</td>
                  <td className="py-2 px-4 border-b">{u.estado}</td>
                  <td className="py-2 px-4 border-b">
                    <button className="text-[#00B7EB] hover:underline mr-2">Editar</button>
                    <button className="text-[#DC2626] hover:underline">Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

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
                  name="nombre"
                  value={nuevoUsuario.nombre}
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
                      <option key={rol} value={rol}>
                        {rol}
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

      <section>
        <h2 className="text-xl font-semibold mb-4">Gestión de Cursos</h2>
        <div className="bg-[#F4F8FB] border border-[#D3D3D3] rounded p-6 text-gray-500">
          Aquí irá la gestión de cursos (crear, editar, eliminar, asignar docente).
        </div>
      </section>
    </div>
  );
}