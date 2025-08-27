"use client";

import { useEffect, useState } from "react";
import {
  getNiveles,
  getLecciones,
  getRecursos,
  eliminarNivel,
  eliminarLeccion,
  eliminarRecurso,
} from "@/services/cursos";
import { FiPlus, FiEdit, FiTrash2, FiChevronDown, FiChevronRight } from "react-icons/fi";
import NivelFormModal from "./NivelFormModal";
import LeccionFormModal from "./LeccionFormModal";
import RecursoFormModal from "./RecursoFormModal";

interface Nivel {
  id: string;
  nombre: string;
  orden: number;
}

interface Leccion {
  id: string;
  nombre: string;
  nivel: string;
  orden: number;
}

interface Recurso {
  id: string;
  nombre: string;
  tipo: string;
  permite_monitoreo: boolean;
  es_evaluable: boolean;
}

export default function DocenteCourseTree({ cursoId }: { cursoId: string }) {
  const [niveles, setNiveles] = useState<Nivel[]>([]);
  const [expandedNiveles, setExpandedNiveles] = useState<string[]>([]);
  const [lecciones, setLecciones] = useState<{ [nivelId: string]: Leccion[] }>({});
  const [expandedLecciones, setExpandedLecciones] = useState<string[]>([]);
  const [recursos, setRecursos] = useState<{ [leccionId: string]: Recurso[] }>({});

  // Modal state for Nivel
  const [nivelModalOpen, setNivelModalOpen] = useState(false);
  const [nivelToEdit, setNivelToEdit] = useState<Nivel | undefined>(undefined);

  // Modal state for Lección
  const [leccionModalOpen, setLeccionModalOpen] = useState(false);
  const [leccionToEdit, setLeccionToEdit] = useState<Leccion | undefined>(undefined);
  const [leccionNivelId, setLeccionNivelId] = useState<string>("");

  // Modal state for Recurso
  const [recursoModalOpen, setRecursoModalOpen] = useState(false);
  const [recursoToEdit, setRecursoToEdit] = useState<Recurso | undefined>(undefined);
  const [recursoLeccionId, setRecursoLeccionId] = useState<string>("");

  // Refresca niveles después de crear/editar/eliminar
  const refreshNiveles = () => {
    const token = localStorage.getItem("token");
    if (token && cursoId) {
      getNiveles(cursoId, token).then(setNiveles);
    }
  };

  // Refresca lecciones de un nivel
  const refreshLecciones = (nivelId: string) => {
    const token = localStorage.getItem("token");
    if (token) {
      getLecciones(nivelId, token).then(lecs =>
        setLecciones(prev => ({ ...prev, [nivelId]: lecs }))
      );
    }
  };

  // Refresca recursos de una lección
  const refreshRecursos = (leccionId: string) => {
    const token = localStorage.getItem("token");
    if (token) {
      getRecursos(leccionId, token).then(recs =>
        setRecursos(prev => ({ ...prev, [leccionId]: recs }))
      );
    }
  };

  useEffect(() => {
    refreshNiveles();
  }, [cursoId]);

  const handleExpandNivel = (nivelId: string) => {
    setExpandedNiveles(prev =>
      prev.includes(nivelId) ? prev.filter(id => id !== nivelId) : [...prev, nivelId]
    );
    if (!lecciones[nivelId]) {
      refreshLecciones(nivelId);
    }
  };

  const handleExpandLeccion = (leccionId: string) => {
    setExpandedLecciones(prev =>
      prev.includes(leccionId) ? prev.filter(id => id !== leccionId) : [...prev, leccionId]
    );
    if (!recursos[leccionId]) {
      refreshRecursos(leccionId);
    }
  };

  // Abrir modal para crear nivel
  const handleAddNivel = () => {
    setNivelToEdit(undefined);
    setNivelModalOpen(true);
  };

  // Abrir modal para editar nivel
  const handleEditNivel = (nivel: Nivel) => {
    setNivelToEdit(nivel);
    setNivelModalOpen(true);
  };

  // Eliminar nivel
  const handleDeleteNivel = async (nivelId: string) => {
    if (window.confirm("¿Seguro que deseas eliminar este nivel?")) {
      const token = localStorage.getItem("token");
      await eliminarNivel(nivelId, token!);
      refreshNiveles();
    }
  };

  // Abrir modal para crear lección
  const handleAddLeccion = (nivelId: string) => {
    setLeccionToEdit(undefined);
    setLeccionNivelId(nivelId);
    setLeccionModalOpen(true);
  };

  // Abrir modal para editar lección
  const handleEditLeccion = (leccion: Leccion, nivelId: string) => {
    setLeccionToEdit(leccion);
    setLeccionNivelId(nivelId);
    setLeccionModalOpen(true);
  };

  // Eliminar lección
  const handleDeleteLeccion = async (leccionId: string, nivelId: string) => {
    if (window.confirm("¿Seguro que deseas eliminar esta lección?")) {
      const token = localStorage.getItem("token");
      await eliminarLeccion(leccionId, token!);
      refreshLecciones(nivelId);
    }
  };

  // Abrir modal para crear recurso
  const handleAddRecurso = (leccionId: string) => {
    setRecursoToEdit(undefined);
    setRecursoLeccionId(leccionId);
    setRecursoModalOpen(true);
  };

  // Abrir modal para editar recurso
  const handleEditRecurso = (recurso: Recurso, leccionId: string) => {
    setRecursoToEdit(recurso);
    setRecursoLeccionId(leccionId);
    setRecursoModalOpen(true);
  };

  // Eliminar recurso
  const handleDeleteRecurso = async (recursoId: string, leccionId: string) => {
    if (window.confirm("¿Seguro que deseas eliminar este recurso?")) {
      const token = localStorage.getItem("token");
      await eliminarRecurso(recursoId, token!);
      refreshRecursos(leccionId);
    }
  };

  return (
    <div className="bg-white rounded shadow p-4 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-[#003087]">Estructura del Curso</h2>
        <button
          className="flex items-center gap-2 px-3 py-1 bg-[#00B7EB] text-white rounded hover:bg-[#0099c6]"
          onClick={handleAddNivel}
        >
          <FiPlus /> Agregar Nivel
        </button>
      </div>
      <ul>
        {niveles
          .sort((a, b) => a.orden - b.orden)
          .map(nivel => (
            <li key={nivel.id} className="mb-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleExpandNivel(nivel.id)}
                  className="text-[#003087] focus:outline-none"
                  title={expandedNiveles.includes(nivel.id) ? "Colapsar" : "Expandir"}
                >
                  {expandedNiveles.includes(nivel.id) ? <FiChevronDown /> : <FiChevronRight />}
                </button>
                <span className="font-semibold">{nivel.nombre}</span>
                <button
                  className="ml-2 text-[#00B7EB] hover:underline flex items-center gap-1"
                  onClick={() => handleEditNivel(nivel)}
                >
                  <FiEdit /> Editar
                </button>
                <button
                  className="ml-1 text-red-500 hover:underline flex items-center gap-1"
                  onClick={() => handleDeleteNivel(nivel.id)}
                >
                  <FiTrash2 /> Eliminar
                </button>
                <button
                  className="ml-1 text-green-600 hover:underline flex items-center gap-1"
                  onClick={() => handleAddLeccion(nivel.id)}
                >
                  <FiPlus /> Agregar Lección
                </button>
              </div>
              {/* Lecciones */}
              {expandedNiveles.includes(nivel.id) && lecciones[nivel.id] && (
                <ul className="ml-8 mt-2">
                  {lecciones[nivel.id].map(leccion => (
                    <li key={leccion.id} className="mb-1">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleExpandLeccion(leccion.id)}
                          className="text-[#003087] focus:outline-none"
                          title={expandedLecciones.includes(leccion.id) ? "Colapsar" : "Expandir"}
                        >
                          {expandedLecciones.includes(leccion.id) ? <FiChevronDown /> : <FiChevronRight />}
                        </button>
                        <span className="font-medium">{leccion.nombre}</span>
                        <button
                          className="ml-2 text-[#00B7EB] hover:underline flex items-center gap-1"
                          onClick={() => handleEditLeccion(leccion, nivel.id)}
                        >
                          <FiEdit /> Editar
                        </button>
                        <button
                          className="ml-1 text-red-500 hover:underline flex items-center gap-1"
                          onClick={() => handleDeleteLeccion(leccion.id, nivel.id)}
                        >
                          <FiTrash2 /> Eliminar
                        </button>
                        <button
                          className="ml-1 text-green-600 hover:underline flex items-center gap-1"
                          onClick={() => handleAddRecurso(leccion.id)}
                        >
                          <FiPlus /> Agregar Recurso
                        </button>
                      </div>
                      {/* Recursos */}
                      {expandedLecciones.includes(leccion.id) && recursos[leccion.id] && (
                        <ul className="ml-8 mt-1">
                          {recursos[leccion.id].map(recurso => (
                            <li key={recurso.id} className="flex items-center gap-2 mb-1">
                              <span className="font-medium">{recurso.nombre}</span>
                              <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">{recurso.tipo}</span>
                              {!recurso.permite_monitoreo && (
                                <span className="text-xs text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded">
                                  Sin monitoreo
                                </span>
                              )}
                              {recurso.es_evaluable && (
                                <span className="text-xs text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                                  Evaluable
                                </span>
                              )}
                              <button
                                className="ml-2 text-[#00B7EB] hover:underline flex items-center gap-1"
                                onClick={() => handleEditRecurso(recurso, leccion.id)}
                              >
                                <FiEdit /> Editar
                              </button>
                              <button
                                className="ml-1 text-red-500 hover:underline flex items-center gap-1"
                                onClick={() => handleDeleteRecurso(recurso.id, leccion.id)}
                              >
                                <FiTrash2 /> Eliminar
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
      </ul>
      {/* Modal para crear/editar nivel */}
      <NivelFormModal
        open={nivelModalOpen}
        onClose={() => setNivelModalOpen(false)}
        onSuccess={refreshNiveles}
        cursoId={cursoId}
        nivel={nivelToEdit}
      />
      {/* Modal para crear/editar lección */}
      <LeccionFormModal
        open={leccionModalOpen}
        onClose={() => setLeccionModalOpen(false)}
        onSuccess={() => {
          setLeccionModalOpen(false);
          if (leccionNivelId) refreshLecciones(leccionNivelId);
        }}
        nivelId={leccionNivelId}
        leccion={leccionToEdit}
      />
      {/* Modal para crear/editar recurso */}
      <RecursoFormModal
        open={recursoModalOpen}
        onClose={() => setRecursoModalOpen(false)}
        onSuccess={() => {
          setRecursoModalOpen(false);
          if (recursoLeccionId) refreshRecursos(recursoLeccionId);
        }}
        leccionId={recursoLeccionId}
        recurso={recursoToEdit}
      />
    </div>
  );
}