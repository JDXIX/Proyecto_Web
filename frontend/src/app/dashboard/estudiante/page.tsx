"use client";

import { useState, useEffect } from "react";
import { FiSearch, FiFilter, FiList } from "react-icons/fi";
import { getCursos } from "@/services/cursos";

export default function EstudianteDashboard() {
  const [cursos, setCursos] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [showFilter, setShowFilter] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      getCursos(token).then(setCursos);
    }
  }, []);

  // Filtrado y ordenamiento
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
        Aquí puedes ver todos los cursos en los que estás inscrito.
      </p>
      {/* Barra de acciones */}
      <div className="flex items-center gap-4 mb-8">
        {/* Buscar */}
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
        {/* Ordenar */}
        <button
          onClick={() => setOrder(order === "asc" ? "desc" : "asc")}
          className="p-2 rounded hover:bg-[#e6f0fa] transition"
          title="Ordenar"
        >
          <FiList className="text-2xl text-[#003087]" />
        </button>
        {/* Filtro (puedes expandir esto según tus necesidades) */}
        <button
          onClick={() => setShowFilter(!showFilter)}
          className="p-2 rounded hover:bg-[#e6f0fa] transition"
          title="Filtrar"
        >
          <FiFilter className="text-2xl text-[#003087]" />
        </button>
        {showFilter && (
          <div className="absolute mt-12 bg-white border rounded shadow p-4 z-50">
            {/* Aquí puedes poner filtros adicionales */}
            <div className="text-sm text-gray-700">Aquí van los filtros...</div>
          </div>
        )}
      </div>
      {/* Cursos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {cursosFiltrados.map(curso => (
          <div key={curso.id} className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
            {/* Aquí tu contenido de cada curso */}
            <div className="text-2xl font-bold text-[#003087] mb-2">{curso.nombre}</div>
            <div className="text-gray-600">{curso.descripcion}</div>
          </div>
        ))}
      </div>
    </div>
  );
}