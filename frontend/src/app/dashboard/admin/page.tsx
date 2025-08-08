"use client";
import { useEffect, useState, useRef } from "react";
import { getUsuarios } from "@/services/usuarios";
import { getCursos } from "@/services/cursos";
import { inscribirEstudiante } from "@/services/inscripciones";
import ProtectedRoute from "@/components/ProtectedRoute";
import { getUsuarioActual } from "@/services/usuarios";
import axios from "axios";

const roles = ["Administrador", "Docente", "Estudiante"];
const estados = ["Activo", "Inactivo"];

export default function AdminDashboard() {
  // Usuario para protección de ruta
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Usuarios
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [nuevoUsuario, setNuevoUsuario] = useState({
    nombre: "",
    email: "",
    rol: "Docente",
    estado: "Activo",
  });

  // Estado para edición de usuario
  const [usuarioEnEdicion, setUsuarioEnEdicion] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Cursos
  const [cursos, setCursos] = useState<any[]>([]);
  const [showCursoModal, setShowCursoModal] = useState(false);
  const docentesDummy = usuarios.filter(
    u => (u.rol === "docente" || u.rol === "Docente") && 
    (u.estado === "Activo" || u.is_active)
  );
  const [nuevoCurso, setNuevoCurso] = useState({
    nombre: "",
    descripcion: "",
    docente: docentesDummy[0]?.nombre || "",
    umbral_nota: 70,
  });

  // Estado para edición de curso
  const [cursoEnEdicion, setCursoEnEdicion] = useState<any>(null);
  const [showEditCursoModal, setShowEditCursoModal] = useState(false);

  // Nueva sección: Inscripción de estudiantes
  const [estudiantesDisponibles, setEstudiantesDisponibles] = useState<any[]>([]);
  const [estudianteSeleccionado, setEstudianteSeleccionado] = useState("");
  const [cursoSeleccionado, setCursoSeleccionado] = useState("");
  const [mensajeInscripcion, setMensajeInscripcion] = useState("");
  const [tipoMensaje, setTipoMensaje] = useState<"success" | "error" | "">("");

  // Nueva sección: Inscripción masiva por CSV
  const [csvResult, setCsvResult] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cargar usuario actual y datos
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      // Obtener el usuario actual para la protección de ruta
      getUsuarioActual(token)
        .then(userData => {
          setUser(userData);
          console.log("Usuario actual:", userData);
        })
        .catch(err => {
          console.error("Error al obtener usuario actual:", err);
        })
        .finally(() => setLoading(false));

      // Cargar la lista de usuarios
      getUsuarios(token)
        .then(data => {
          setUsuarios(data);
          // Filtrar estudiantes para inscripción
          setEstudiantesDisponibles(data.filter((u: { rol: any; }) => (u.rol || "").toLowerCase().trim() === "estudiante"));
          console.log("Usuarios cargados desde API:", data);
        })
        .catch(err => {
          console.error("Error al cargar usuarios:", err);
        });

      // Cargar la lista de cursos
      getCursos(token)
        .then(data => {
          setCursos(data);
          console.log("Cursos cargados desde API:", data);
        })
        .catch(err => {
          console.error("Error al cargar cursos:", err);
        });
    } else {
      setLoading(false);
    }
  }, []);

  // Handlers usuarios (solo frontend por ahora)
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

  const handleEliminarUsuario = (id: number) => {
    if (confirm("¿Estás seguro de que deseas eliminar este usuario?")) {
      setUsuarios(usuarios.filter(u => u.id !== id));
    }
  };

  const handleEditarUsuario = (usuario: any) => {
    setUsuarioEnEdicion(usuario);
    setShowEditModal(true);
  };

  const handleGuardarEdicionUsuario = (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuarioEnEdicion || !usuarioEnEdicion.nombre || !usuarioEnEdicion.email) return;
    setUsuarios(usuarios.map(u =>
      u.id === usuarioEnEdicion.id ? usuarioEnEdicion : u
    ));
    setUsuarioEnEdicion(null);
    setShowEditModal(false);
  };

  // Handlers cursos
  const handleCursoInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setNuevoCurso({
      ...nuevoCurso,
      [e.target.name]: e.target.name === 'umbral_nota' ? Number(e.target.value) : e.target.value
    });
  };

  const handleEditCursoInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (cursoEnEdicion) {
      setCursoEnEdicion({
        ...cursoEnEdicion,
        [e.target.name]: e.target.name === 'umbral_nota' ? Number(e.target.value) : e.target.value
      });
    }
  };

  const handleCrearCurso = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoCurso.nombre || !nuevoCurso.docente) return;
    setCursos([
      ...cursos,
      {
        ...nuevoCurso,
        id: cursos.length + 1,
      },
    ]);
    setNuevoCurso({ nombre: "", descripcion: "", docente: docentesDummy[0]?.nombre || "", umbral_nota: 70 });
    setShowCursoModal(false);
  };

  const handleEliminarCurso = (id: number) => {
    if (confirm("¿Estás seguro de que deseas eliminar este curso?")) {
      setCursos(cursos.filter(c => c.id !== id));
    }
  };

  const handleEditarCurso = (curso: any) => {
    setCursoEnEdicion(curso);
    setShowEditCursoModal(true);
  };

  const handleGuardarEdicionCurso = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cursoEnEdicion || !cursoEnEdicion.nombre || !cursoEnEdicion.docente) return;
    setCursos(cursos.map(c =>
      c.id === cursoEnEdicion.id ? cursoEnEdicion : c
    ));
    setCursoEnEdicion(null);
    setShowEditCursoModal(false);
  };

  // Handlers para inscripción
  const handleInscribirEstudiante = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!estudianteSeleccionado || !cursoSeleccionado) {
      setMensajeInscripcion("Por favor selecciona estudiante y curso");
      setTipoMensaje("error");
      return;
    }

    try {
      await inscribirEstudiante(estudianteSeleccionado, cursoSeleccionado);
      setMensajeInscripcion("¡Estudiante inscrito correctamente!");
      setTipoMensaje("success");
      
      // Limpiar selección
      setEstudianteSeleccionado("");
      setCursoSeleccionado("");
      
      // Ocultar mensaje después de 3 segundos
      setTimeout(() => {
        setMensajeInscripcion("");
        setTipoMensaje("");
      }, 3000);
    } catch (error: any) {
      setMensajeInscripcion(error.message || "Error al inscribir estudiante");
      setTipoMensaje("error");
    }
  };

  // Handler para inscripción masiva por CSV
  const handleCsvUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append("file", file);
    
    const token = localStorage.getItem("token");
    try {
      const res = await axios.post(
        "http://localhost:8000/api/inscripciones/cargar_csv/",
        formData,
        { 
          headers: { 
            Authorization: `Bearer ${token}`, 
            "Content-Type": "multipart/form-data" 
          } 
        }
      );
      setCsvResult(res.data);
    } catch (err: any) {
      console.error("Error al procesar CSV:", err);
      setCsvResult([{ status: "Error al procesar el archivo" }]);
    }
  };

  // Mostrar estado de carga
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="text-xl font-semibold">Cargando...</div>
    </div>;
  }

  return (
    <ProtectedRoute allowedRoles={["admin", "administrador"]} user={user}>
      <div className="p-8 w-full max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-[#003087] mb-6">Panel de Administrador</h1>
        
        {/* Gestión de Usuarios */}
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
        </section>

        {/* NUEVA SECCIÓN: Inscribir estudiantes a cursos */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Inscripción de Estudiantes</h2>
          </div>
          <div className="bg-white border border-[#D3D3D3] rounded shadow p-6">
            <form onSubmit={handleInscribirEstudiante} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1">Estudiante</label>
                  <select
                    value={estudianteSeleccionado}
                    onChange={(e) => setEstudianteSeleccionado(e.target.value)}
                    className="w-full border border-[#D3D3D3] rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00B7EB]"
                    required
                  >
                    <option value="">Selecciona un estudiante</option>
                    {estudiantesDisponibles.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.first_name || e.nombre} {e.last_name || ""} ({e.email})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Curso</label>
                  <select
                    value={cursoSeleccionado}
                    onChange={(e) => setCursoSeleccionado(e.target.value)}
                    className="w-full border border-[#D3D3D3] rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00B7EB]"
                    required
                  >
                    <option value="">Selecciona un curso</option>
                    {cursos.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <button
                  type="submit"
                  className="bg-[#003087] text-white px-4 py-2 rounded font-semibold hover:bg-[#002060] transition"
                >
                  Inscribir Estudiante
                </button>
              </div>
              {mensajeInscripcion && (
                <div className={`mt-2 text-sm ${
                  tipoMensaje === "success" ? "text-green-600" : "text-red-600"
                }`}>
                  {mensajeInscripcion}
                </div>
              )}
            </form>
          </div>
        </section>

        {/* NUEVA SECCIÓN: Inscripción masiva por CSV */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Inscripción Masiva por CSV</h2>
          </div>
          <div className="bg-white border border-[#D3D3D3] rounded shadow p-6">
            <form onSubmit={handleCsvUpload} className="space-y-4">
              <div>
                <label className="block font-semibold mb-2">
                  Sube un archivo CSV con formato: email,curso_id
                </label>
                <div className="flex flex-col md:flex-row gap-4 items-start">
                  <input 
                    type="file" 
                    accept=".csv" 
                    ref={fileInputRef} 
                    className="border border-[#D3D3D3] rounded px-3 py-2 w-full md:w-auto"
                    required 
                  />
                  <button
                    type="submit"
                    className="bg-[#003087] text-white px-4 py-2 rounded font-semibold hover:bg-[#002060] transition"
                  >
                    Subir y Procesar CSV
                  </button>
                </div>
              </div>

              {csvResult.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-bold mb-2">Resultados de la inscripción masiva:</h3>
                  <div className="max-h-60 overflow-y-auto border border-[#D3D3D3] rounded">
                    <table className="min-w-full bg-white">
                      <thead>
                        <tr className="bg-[#F4F8FB] text-[#003087]">
                          <th className="py-2 px-4 border-b text-left">Email</th>
                          <th className="py-2 px-4 border-b text-left">Curso</th>
                          <th className="py-2 px-4 border-b text-left">Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {csvResult.map((r, i) => (
                          <tr key={i} className="hover:bg-[#F4F8FB]">
                            <td className="py-2 px-4 border-b">{r.email || "—"}</td>
                            <td className="py-2 px-4 border-b">{r.curso_id || "—"}</td>
                            <td className={`py-2 px-4 border-b ${
                              r.status === "inscrito" 
                                ? "text-green-600" 
                                : r.status === "ya inscrito" 
                                ? "text-blue-600" 
                                : "text-red-600"
                            }`}>
                              {r.status}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-3 text-sm text-gray-600">
                    <p>
                      Total: {csvResult.length} registros procesados |  
                      Exitosos: {csvResult.filter(r => r.status === "inscrito" || r.status === "ya inscrito").length} |
                      Con error: {csvResult.filter(r => r.status !== "inscrito" && r.status !== "ya inscrito").length}
                    </p>
                  </div>
                </div>
              )}
            </form>
          </div>
        </section>

        {/* Gestión de Cursos */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Gestión de Cursos</h2>
            <button
              className="bg-[#00B7EB] text-white px-4 py-2 rounded font-semibold hover:bg-[#009fc2] transition"
              onClick={() => setShowCursoModal(true)}
            >
              Crear curso
            </button>
          </div>
          <div className="overflow-x-auto rounded shadow mb-6">
            <table className="min-w-full bg-white border border-[#D3D3D3]">
              <thead>
                <tr className="bg-[#F4F8FB] text-[#003087]">
                  {/* Nueva columna para mostrar el ID del curso */}
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
                    {/* Nueva celda para mostrar el ID del curso */}
                    <td className="py-2 px-4 border-b">{c.id}</td>
                    <td className="py-2 px-4 border-b">{c.nombre}</td>
                    <td className="py-2 px-4 border-b">{c.descripcion}</td>
                    <td className="py-2 px-4 border-b">{c.docente}</td>
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
                    name="nombre"
                    value={usuarioEnEdicion.nombre}
                    onChange={handleEditInputChange}
                    className="w-full border border-[#D3D3D3] rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00B7EB]"
                    required
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

        {/* Modal para crear curso */}
        {showCursoModal && (
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
                    onChange={handleCursoInputChange}
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
                    onChange={handleCursoInputChange}
                    className="w-full border border-[#D3D3D3] rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00B7EB]"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Docente</label>
                  <select
                    name="docente"
                    value={nuevoCurso.docente}
                    onChange={handleCursoInputChange}
                    className="w-full border border-[#D3D3D3] rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00B7EB]"
                    required
                  >
                    {docentesDummy.map((d) => (
                      <option key={d.nombre || d.first_name} value={d.nombre || d.first_name}>
                        {d.nombre || d.first_name}
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
                    onChange={handleCursoInputChange}
                    className="w-full border border-[#D3D3D3] rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00B7EB]"
                    required
                  />
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    type="button"
                    className="px-4 py-2 rounded bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300"
                    onClick={() => setShowCursoModal(false)}
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
        {showEditCursoModal && cursoEnEdicion && (
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
                    onChange={handleEditCursoInputChange}
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
                    onChange={handleEditCursoInputChange}
                    className="w-full border border-[#D3D3D3] rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00B7EB]"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Docente</label>
                  <select
                    name="docente"
                    value={cursoEnEdicion.docente}
                    onChange={handleEditCursoInputChange}
                    className="w-full border border-[#D3D3D3] rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00B7EB]"
                    required
                  >
                    {docentesDummy.map((d) => (
                      <option key={d.nombre || d.first_name} value={d.nombre || d.first_name}>
                        {d.nombre || d.first_name}
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
                    onChange={handleEditCursoInputChange}
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
                      setShowEditCursoModal(false);
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