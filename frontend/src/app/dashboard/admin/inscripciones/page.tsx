"use client";

import { useEffect, useState, useRef } from "react";
import { getUsuarios, getUsuarioActual } from "@/services/usuarios";
import { getCursos } from "@/services/cursos";
import { inscribirEstudiante } from "@/services/inscripciones";
import ProtectedRoute from "@/components/ProtectedRoute";
import axios from "axios";

export default function InscripcionesPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [cursos, setCursos] = useState<any[]>([]);
  const [estudiantesDisponibles, setEstudiantesDisponibles] = useState<any[]>([]);
  const [estudianteSeleccionado, setEstudianteSeleccionado] = useState("");
  const [cursoSeleccionado, setCursoSeleccionado] = useState("");
  const [mensajeInscripcion, setMensajeInscripcion] = useState("");
  const [tipoMensaje, setTipoMensaje] = useState<"success" | "error" | "">("");

  // Para inscripción masiva por CSV
  const [csvResult, setCsvResult] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      // Carga el usuario real para ProtectedRoute
      getUsuarioActual(token)
        .then(userData => setUser(userData))
        .catch(() => setUser(null))
        .finally(() => setLoading(false));

      getUsuarios(token)
        .then(data => {
          setUsuarios(data);
          setEstudiantesDisponibles(data.filter((u: any) => (u.rol || "").toLowerCase().trim() === "estudiante"));
        })
        .catch(() => {});
      getCursos(token)
        .then(data => setCursos(data))
        .catch(() => {});
    } else {
      setLoading(false);
    }
  }, []);

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
      setEstudianteSeleccionado("");
      setCursoSeleccionado("");
      setTimeout(() => {
        setMensajeInscripcion("");
        setTipoMensaje("");
      }, 3000);
    } catch (error: any) {
      setMensajeInscripcion(error.message || "Error al inscribir estudiante");
      setTipoMensaje("error");
    }
  };

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
      setCsvResult([{ status: "Error al procesar el archivo" }]);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="text-xl font-semibold">Cargando...</div>
    </div>;
  }

  return (
    <ProtectedRoute allowedRoles={["admin", "administrador"]} user={user}>
      <div className="p-8 w-full max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-[#003087] mb-6">Inscripción de Estudiantes</h1>

        {/* Inscripción individual */}
        <section className="mb-10">
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

        {/* Inscripción masiva por CSV */}
        <section className="mb-10">
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
      </div>
    </ProtectedRoute>
  );
}