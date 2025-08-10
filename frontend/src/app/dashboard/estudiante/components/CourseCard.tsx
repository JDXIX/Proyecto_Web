"use client";

import React from "react";
import { useRouter } from "next/navigation";

interface CourseCardProps {
  curso: {
    id: number | string;
    nombre: string;
    descripcion?: string;
    icono?: string; // URL o nombre de icono, opcional
    imagen?: string; // URL de imagen, opcional
  };
}

export default function CourseCard({ curso }: CourseCardProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/dashboard/estudiante/${curso.id}`);
  };

  return (
    <div
      className="flex flex-col items-center cursor-pointer group"
      onClick={handleClick}
      tabIndex={0}
      role="button"
      onKeyDown={e => (e.key === "Enter" ? handleClick() : undefined)}
    >
      <div className="rounded-full bg-white shadow-lg border-4 border-[#00B7EB] w-28 h-28 flex items-center justify-center mb-3 transition group-hover:shadow-2xl group-hover:scale-105">
        {curso.imagen ? (
          <img
            src={curso.imagen}
            alt={curso.nombre}
            className="w-20 h-20 object-contain rounded-full"
          />
        ) : (
          // Ícono por defecto si no hay imagen
          <svg
            className="w-16 h-16 text-[#003087]"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <circle cx="12" cy="12" r="10" stroke="#00B7EB" strokeWidth="2" fill="#E6F0FA" />
            <path
              d="M8 15h8M8 11h8M8 7h8"
              stroke="#003087"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>
      <div className="text-center">
        <span className="block text-lg font-semibold text-[#003087] truncate w-32">
          {curso.nombre}
        </span>
        {curso.descripcion && (
          <span className="block text-xs text-gray-500 mt-1 truncate w-32">
            {curso.descripcion}
          </span>
        )}
      </div>
    </div>
  );
}