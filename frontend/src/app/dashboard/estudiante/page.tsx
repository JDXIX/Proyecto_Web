"use client";

import { useState, useEffect } from "react";
import { FiSearch, FiList } from "react-icons/fi";
import { getCursos } from "@/services/cursos";
import Link from "next/link";
import type { Curso } from "@/types";

export default function EstudianteDashboard() {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [search, setSearch] = useState("");
  const [order, setOrder] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      getCursos(token).then(setCursos);
    }
  }, []);

  // Filtrado y ordenamiento (LO MISMO)
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
    <div className="w-full h-full p-4 md:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[var(--color-primary)] mb-1">
          Mi Portal Estudiantil
        </h1>
        <p className="text-base md:text-lg text-[var(--color-text-light)]">
          Clases y cursos en los que estás inscrito.
        </p>
      </div>

      {/* Barra de acciones */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Buscar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar curso..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 border border-[var(--color-border)] rounded-lg bg-white
                       focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] shadow-sm"
          />
          <FiSearch className="absolute left-3 top-2.5 text-[var(--color-primary)]" />
        </div>
        {/* Ordenar */}
        <button
          onClick={() => setOrder(order === "asc" ? "desc" : "asc")}
          className="p-2 rounded-lg border border-[var(--color-border)] bg-white 
                     hover:bg-blue-50 transition shadow-sm"
          title="Ordenar"
        >
          <FiList className="text-2xl text-[var(--color-primary)]" />
        </button>
      </div>

      {/* Cards de cursos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        {cursosFiltrados.map((curso) => (
          <Link
            key={curso.id}
            href={`/dashboard/estudiante/${curso.id}`}
            className="bg-white rounded-2xl shadow-sm border border-[var(--color-border)]
                       p-6 flex flex-col items-center hover:shadow-md hover:-translate-y-1 
                       transition cursor-pointer"
          >
            {/* Ícono circular */}
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-[#EEF2FF] flex items-center justify-center mb-4 shadow-sm">
              <span className="text-3xl md:text-4xl text-[var(--color-primary)]">
                📘
              </span>
            </div>

            <div className="text-lg md:text-xl font-semibold text-[var(--color-text)] mb-2 text-center">
              {curso.nombre}
            </div>
            <div className="text-sm text-[var(--color-text-light)] text-center line-clamp-3">
              {curso.descripcion}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
