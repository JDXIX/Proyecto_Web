"use client";

import { useState, useEffect } from "react";
import { FiSearch, FiList } from "react-icons/fi";
import { getCursosDocente } from "@/services/cursos";
import Link from "next/link";
import type { Curso } from "@/types";

export default function DocenteDashboard() {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [search, setSearch] = useState("");
  const [order, setOrder] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      getCursosDocente(token).then(setCursos);
    }
  }, []);

  const cursosFiltrados = cursos
    .filter((curso) =>
      curso.nombre.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) =>
      order === "asc"
        ? a.nombre.localeCompare(b.nombre)
        : b.nombre.localeCompare(a.nombre)
    );

  return (
    <div className="w-full h-full p-4 md:p-8">
      <h1 className="text-3xl font-bold text-[#4B6BFB] mb-2">Mis Cursos</h1>
      <p className="mb-8 text-base md:text-lg text-gray-600">
        Aquí puedes gestionar los cursos que impartes.
      </p>

      {/* Barra de búsqueda y orden */}
      <div className="flex flex-wrap items-center gap-4 mb-8">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar curso..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 border border-[#E5E7EB] rounded-lg bg-white
                       focus:outline-none focus:ring-2 focus:ring-[#4B6BFB] shadow-sm"
          />
          <FiSearch className="absolute left-3 top-2.5 text-[#4B6BFB]" />
        </div>
        <button
          onClick={() => setOrder(order === "asc" ? "desc" : "asc")}
          className="p-2 rounded-lg border border-[#E5E7EB] bg-white hover:bg-[#F3F4FF] transition shadow-sm"
          title="Ordenar"
        >
          <FiList className="text-2xl text-[#4B6BFB]" />
        </button>
      </div>

      {/* Cards de cursos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        {cursosFiltrados.map((curso) => (
          <Link
            key={curso.id}
            href={`/dashboard/docente/${curso.id}`}
            className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB]
                       p-6 flex flex-col items-center hover:shadow-md hover:-translate-y-1 
                       transition cursor-pointer"
          >
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-[#EEF2FF] flex items-center justify-center mb-4 shadow-sm">
              <span className="text-3xl md:text-4xl text-[#4B6BFB]">📘</span>
            </div>
            <div className="text-lg md:text-xl font-semibold text-[#111827] mb-2 text-center">
              {curso.nombre}
            </div>
            <div className="text-sm text-gray-600 text-center line-clamp-3">
              {curso.descripcion}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
