"use client";
import { useEffect, useState } from "react";
import { getInscripcionesPorEstudiante } from "@/services/inscripciones";
import { getUsuarioActual } from "@/services/usuarios";
import axios from "axios";

export default function EstudianteDashboard() {
  const [user, setUser] = useState<any>(null);
  const [inscripciones, setInscripciones] = useState<any[]>([]);
  const [cursos, setCursos] = useState<any[]>([]);
  const [cursoSeleccionado, setCursoSeleccionado] = useState<any>(null);
  const [niveles, setNiveles] = useState<any[]>([]);
  const [nivelSeleccionado, setNivelSeleccionado] = useState<any>(null);
  const [fases, setFases] = useState<any[]>([]);
  const [faseSeleccionada, setFaseSeleccionada] = useState<any>(null);
  const [recursos, setRecursos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      getUsuarioActual(token).then(userData => {
        setUser(userData);
        getInscripcionesPorEstudiante(userData.id).then(insc => {
          setInscripciones(insc);
          setCursos(insc.map((i: any) => i.curso));
          setLoading(false);
        });
      });
    }
  }, []);

  useEffect(() => {
    if (cursoSeleccionado) {
      const token = localStorage.getItem("token");
      axios.get(`http://localhost:8000/api/niveles/?curso=${cursoSeleccionado.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => setNiveles(res.data));
    }
  }, [cursoSeleccionado]);

  useEffect(() => {
    if (nivelSeleccionado) {
      const token = localStorage.getItem("token");
      axios.get(`http://localhost:8000/api/fases/?nivel=${nivelSeleccionado.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => setFases(res.data));
    }
  }, [nivelSeleccionado]);

  useEffect(() => {
    if (faseSeleccionada) {
      const token = localStorage.getItem("token");
      axios.get(`http://localhost:8000/api/recursos/?fase=${faseSeleccionada.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => setRecursos(res.data));
    }
  }, [faseSeleccionada]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen text-xl">Cargando...</div>;
  }

  return (
    <div className="p-8 w-full max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-[#003087] mb-6">Mis Cursos</h1>
      {/* Cursos inscritos */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Cursos inscritos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cursos.map((curso: any) => (
            <div
              key={curso.id}
              className={`border rounded-lg p-4 shadow cursor-pointer transition ${
                cursoSeleccionado?.id === curso.id ? "bg-[#003087] text-white" : "bg-white"
              }`}
              onClick={() => {
                setCursoSeleccionado(curso);
                setNivelSeleccionado(null);
                setFaseSeleccionada(null);
                setRecursos([]);
              }}
            >
              <div className="font-bold text-lg">{curso.nombre}</div>
              <div className="text-sm">{curso.descripcion}</div>
              <div className="text-xs mt-2">Docente: {curso.docente?.first_name || curso.docente?.nombre || "N/A"}</div>
            </div>
          ))}
        </div>
      </div>
      {/* Niveles */}
      {cursoSeleccionado && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-2">Niveles del curso: {cursoSeleccionado.nombre}</h2>
          <div className="flex flex-wrap gap-4">
            {niveles.map((nivel: any) => (
              <button
                key={nivel.id}
                className={`px-6 py-3 rounded-lg shadow font-semibold transition ${
                  nivelSeleccionado?.id === nivel.id ? "bg-[#00B7EB] text-white" : "bg-gray-200"
                }`}
                onClick={() => {
                  setNivelSeleccionado(nivel);
                  setFaseSeleccionada(null);
                  setRecursos([]);
                }}
              >
                {nivel.nombre}
              </button>
            ))}
          </div>
        </div>
      )}
      {/* Fases */}
      {nivelSeleccionado && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-2">Fases del nivel: {nivelSeleccionado.nombre}</h2>
          <div className="flex flex-wrap gap-4">
            {fases.map((fase: any) => (
              <button
                key={fase.id}
                className={`px-6 py-3 rounded-lg shadow font-semibold transition ${
                  faseSeleccionada?.id === fase.id ? "bg-[#00B7EB] text-white" : "bg-gray-200"
                }`}
                onClick={() => {
                  setFaseSeleccionada(fase);
                  setRecursos([]);
                }}
              >
                {fase.nombre}
              </button>
            ))}
          </div>
        </div>
      )}
      {/* Recursos */}
      {faseSeleccionada && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-2">Recursos de la fase: {faseSeleccionada.nombre}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recursos.map((recurso: any) => (
              <div key={recurso.id} className="border rounded-lg p-4 shadow bg-white">
                <div className="font-bold">{recurso.nombre}</div>
                <div className="text-sm mb-2">Tipo: {recurso.tipo}</div>
                {/* Aquí puedes agregar enlaces o vistas previas */}
                {recurso.tipo === "video" && recurso.archivo && (
                  <video controls className="w-full mt-2">
                    <source src={recurso.archivo} type="video/mp4" />
                    Tu navegador no soporta el video.
                  </video>
                )}
                {recurso.tipo === "pdf" && recurso.archivo && (
                  <a href={recurso.archivo} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                    Ver PDF
                  </a>
                )}
                {/* Otros tipos: quiz, simulador, archivo */}
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Aquí puedes agregar barra de progreso, retroalimentación, recomendaciones, etc. */}
    </div>
  );
}