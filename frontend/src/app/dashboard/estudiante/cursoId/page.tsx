"use client";

import React, { useEffect, useState } from "react";
import CourseSidebar from "./components/CourseSidebar";
import ResourceViewer from "./components/ResourceViewer";
import { useParams } from "next/navigation";
import { getCursoDetalle } from "@/services/cursos";

// Tipos locales (puedes moverlos a un archivo types si lo prefieres)
interface Recurso {
  id: number | string;
  nombre: string;
  tipo: string;
  url?: string;
  descripcion?: string;
  esCalificado?: boolean;
  completado?: boolean;
  haEmpezado?: boolean;
}

interface Leccion {
  id: number | string;
  nombre: string;
  recursos: Recurso[];
}

interface Nivel {
  id: number | string;
  nombre: string;
  lecciones: Leccion[];
}

interface Curso {
  id: number | string;
  nombre: string;
  icono?: string;
  niveles: Nivel[];
}

export default function CursoEstudiantePage() {
  const params = useParams();
  const cursoId = params?.cursoId as string | number;

  const [curso, setCurso] = useState<Curso | null>(null);
  const [loading, setLoading] = useState(true);

  // Estado de selección
  const [seleccion, setSeleccion] = useState<{
    nivelId: string | number;
    leccionId: string | number;
    recursoId: string | number;
  } | null>(null);

  // Estado de navegación y recurso actual
  const [recursoActual, setRecursoActual] = useState<Recurso | null>(null);
  const [breadcrumb, setBreadcrumb] = useState<{ nivel: string; leccion: string; recurso: string } | null>(null);

  // Cargar datos del curso
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && cursoId) {
      getCursoDetalle(cursoId, token)
        .then((data) => {
          setCurso(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [cursoId]);

  // Actualiza el recurso actual y breadcrumb cuando cambia la selección
  useEffect(() => {
    if (!curso || !seleccion) {
      setRecursoActual(null);
      setBreadcrumb(null);
      return;
    }
    const nivel = curso.niveles.find((n) => n.id === seleccion.nivelId);
    const leccion = nivel?.lecciones.find((l) => l.id === seleccion.leccionId);
    const recurso = leccion?.recursos.find((r) => r.id === seleccion.recursoId) || null;
    setRecursoActual(recurso || null);
    setBreadcrumb(
      recurso && nivel && leccion
        ? { nivel: nivel.nombre, leccion: leccion.nombre, recurso: recurso.nombre }
        : null
    );
  }, [seleccion, curso]);

  // Navegación entre recursos (anterior/siguiente)
  const getFlatRecursos = () => {
    if (!curso) return [];
    const recursos: { nivelId: string | number; leccionId: string | number; recursoId: string | number }[] = [];
    curso.niveles.forEach((nivel) =>
      nivel.lecciones.forEach((leccion) =>
        leccion.recursos.forEach((recurso) =>
          recursos.push({ nivelId: nivel.id, leccionId: leccion.id, recursoId: recurso.id })
        )
      )
    );
    return recursos;
  };

  const flatRecursos = getFlatRecursos();
  const currentIndex = flatRecursos.findIndex(
    (r) =>
      r.nivelId === seleccion?.nivelId &&
      r.leccionId === seleccion?.leccionId &&
      r.recursoId === seleccion?.recursoId
  );

  // Lógica para saber si se puede navegar (según reglas)
  const puedeNavegar =
    recursoActual && (
      !recursoActual.esCalificado ||
      recursoActual.completado ||
      !recursoActual.haEmpezado
    );

  const handleAnterior = () => {
    if (currentIndex > 0 && puedeNavegar) {
      setSeleccion(flatRecursos[currentIndex - 1]);
    }
  };

  const handleSiguiente = () => {
    if (currentIndex < flatRecursos.length - 1 && puedeNavegar) {
      setSeleccion(flatRecursos[currentIndex + 1]);
    }
  };

  // Cuando el usuario selecciona un recurso en el sidebar
  const handleSeleccionarRecurso = (nivelId: string | number, leccionId: string | number, recursoId: string | number) => {
    setSeleccion({ nivelId, leccionId, recursoId });
  };

  // Cuando el usuario da clic en "Empezar" en un recurso calificado
  const handleEmpezarRecurso = (recurso: Recurso) => {
    // Aquí puedes actualizar el estado para marcar que ha empezado (y activar monitoreo, etc.)
    setRecursoActual({ ...recurso, haEmpezado: true });
    // También puedes hacer una petición al backend si es necesario
  };

  return (
    <div className="flex flex-col md:flex-row h-[80vh] bg-[#F4F8FB] rounded shadow">
      {/* Sidebar */}
      <div className="md:w-1/3 w-full border-r border-[#E6F0FA] bg-white">
        {loading ? (
          <div className="p-8 text-center text-[#003087] font-semibold">Cargando curso...</div>
        ) : curso ? (
          <CourseSidebar
            curso={curso}
            niveles={curso.niveles}
            recursoSeleccionado={seleccion}
            onSeleccionarRecurso={handleSeleccionarRecurso}
            onEmpezarRecurso={handleEmpezarRecurso}
          />
        ) : (
          <div className="p-8 text-center text-gray-500">No se encontró el curso.</div>
        )}
      </div>
      {/* Panel central */}
      <div className="flex-1 p-6 flex flex-col">
        <ResourceViewer
          recurso={recursoActual}
          breadcrumb={breadcrumb}
          onAnterior={handleAnterior}
          onSiguiente={handleSiguiente}
          puedeNavegar={!!puedeNavegar}
        />
      </div>
    </div>
  );
}