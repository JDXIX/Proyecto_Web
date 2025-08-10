"use client";

import React, { useEffect, useState } from "react";
import StudentDashboardHeader from "./components/StudentDashboardHeader";
import CourseGrid from "./components/CourseGrid";
import { getCursos } from "@/services/cursos";

export default function EstudianteDashboardPage() {
  const [cursos, setCursos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      getCursos(token)
        .then((data) => {
          // Si tu backend ya devuelve solo los cursos inscritos, usa directamente:
          setCursos(data);
          // Si necesitas filtrar, asegúrate de que la propiedad sea correcta:
          // setCursos(data.filter((curso: any) => curso.inscrito === true));
        })
        .catch(() => setCursos([]))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  return (
    <div className="w-full h-full min-h-[calc(100vh-120px)] flex flex-col">
      <StudentDashboardHeader />
      <div className="mt-8 flex-1">
        {loading ? (
          <div className="text-center text-lg text-[#003087] font-semibold">Cargando cursos...</div>
        ) : cursos.length === 0 ? (
          <div className="text-center text-gray-500 text-lg">No estás inscrito en ningún curso.</div>
        ) : (
          <CourseGrid cursos={cursos} />
        )}
      </div>
    </div>
  );
}