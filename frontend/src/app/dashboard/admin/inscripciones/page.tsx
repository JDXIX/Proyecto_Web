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
        .then((userData) => setUser(userData))
        .catch(() => setUser(null))
        .finally(() => setLoading(false));

      getUsuarios(token)
        .then((data) => {
          setUsuarios(data);
          setEstudiantesDisponibles(
            data.filter(
              (u: any) =>
                (u.rol || "").toLowerCase().trim() === "estudiante"
            )
          );
        })
        .catch(() => {});

      getCursos(token)
        .then((data) => setCursos(data))
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
      setMensajeInscripcion(
        error.message || "Error al inscribir estudiante"
      );
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
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setCsvResult(res.data);
    } catch (err: any) {
      setCsvResult([{ status: "Error al procesar el archivo" }]);
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
      <div className="w-full h-full px-4 md:px-8 py-6 md:py-8 max-w-5xl mx-auto space-y-8">
        {/* HEADER */}
        <header className="space-y-1">
          <h1 className="title mb-1">Inscripción de Estudiantes</h1>
          <p className="text-sm text-[var(--color-text-light)]">
            Administra inscripciones individuales y masivas de estudiantes en los
            cursos activos de la plataforma.
          </p>
        </header>

        {/* INSCRIPCIÓN INDIVIDUAL */}
        <section className="space-y-4">
          <h2 className="text-base font-semibold text-[var(--color-text)]">
            Inscripción individual
          </h2>

          <div className="card p-6 md:p-7">
            <form
              onSubmit={handleInscribirEstudiante}
              className="space-y-5"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Estudiante
                  </label>
                  <select
                    value={estudianteSeleccionado}
                    onChange={(e) =>
                      setEstudianteSeleccionado(e.target.value)
                    }
                    className="w-full border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                    required
                  >
                    <option value="">Selecciona un estudiante</option>
                    {estudiantesDisponibles.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.first_name || e.nombre} {e.last_name || ""} (
                        {e.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Curso
                  </label>
                  <select
                    value={cursoSeleccionado}
                    onChange={(e) => setCursoSeleccionado(e.target.value)}
                    className="w-full border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
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

              <div className="flex justify-end">
                <button type="submit" className="btn-primary">
                  Inscribir estudiante
                </button>
              </div>

              {mensajeInscripcion && (
                <div
                  className={`text-sm mt-1 ${
                    tipoMensaje === "success"
                      ? "text-green-700"
                      : "text-red-600"
                  }`}
                >
                  {mensajeInscripcion}
                </div>
              )}
            </form>
          </div>
        </section>


      </div>
    </ProtectedRoute>
  );
}
