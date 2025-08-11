import React from "react";
import { FiSearch, FiFilter, FiList } from "react-icons/fi";

export default function StudentDashboardHeader() {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
      <div>
        <h1 className="text-3xl font-bold text-[#003087] tracking-wide mb-1">
          Mis Cursos
        </h1>
        <p className="text-gray-600 text-base">
          Aquí puedes ver todos los cursos en los que estás inscrito.
        </p>
      </div>
      <div className="flex items-center gap-4">
        <button
          type="button"
          className="p-2 rounded-full hover:bg-[#E6F0FA] transition"
          title="Buscar"
        >
          <FiSearch className="text-2xl text-[#003087]" />
        </button>
        <button
          type="button"
          className="p-2 rounded-full hover:bg-[#E6F0FA] transition"
          title="Filtrar"
        >
          <FiFilter className="text-2xl text-[#003087]" />
        </button>
        <button
          type="button"
          className="p-2 rounded-full hover:bg-[#E6F0FA] transition"
          title="Ordenar"
        >
          <FiList className="text-2xl text-[#003087]" />
        </button>
      </div>
    </div>
  );
}