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
    .filter(curso =>
      curso.nombre.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) =>
      order === "asc"
        ? a.nombre.localeCompare(b.nombre)
        : b.nombre.localeCompare(a.nombre)
    );

  return (
    <div className="w-full h-full p-4 md:p-8">
      <h1 className="text-3xl font-bold text-[#003087] mb-2">Mis Cursos</h1>
      <p className="mb-8 text-lg text-gray-700">
        Aquí puedes gestionar los cursos que impartes.
      </p>
      <div className="flex items-center gap-4 mb-8">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar curso..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#00B7EB]"
          />
          <FiSearch className="absolute left-3 top-2.5 text-[#003087]" />
        </div>
        <button
          onClick={() => setOrder(order === "asc" ? "desc" : "asc")}
          className="p-2 rounded hover:bg-[#e6f0fa] transition"
          title="Ordenar"
        >
          <FiList className="text-2xl text-[#003087]" />
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {cursosFiltrados.map(curso => (
          <Link
            key={curso.id}
            href={`/dashboard/docente/${curso.id}`}
            className="bg-white rounded-lg shadow p-6 flex flex-col items-center hover:shadow-lg transition cursor-pointer"
          >
            <div className="w-24 h-24 rounded-full bg-[#E6F0FA] flex items-center justify-center mb-4 shadow">
              <span className="text-4xl text-[#00B7EB]">📘</span>
            </div>
            <div className="text-xl font-bold text-[#003087] mb-2 text-center">{curso.nombre}</div>
            <div className="text-gray-600 text-center">{curso.descripcion}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}