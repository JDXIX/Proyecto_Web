"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { Curso } from "@/types";

interface CourseCardProps {
  curso: Curso & {
    icono?: string;
    imagen?: string;
  };
}

export default function CourseCard({ curso }: CourseCardProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/dashboard/estudiante/${curso.id}`);
  };

  return (
    <div
      className="flex flex-col items-center cursor-pointer group p-4 rounded-xl bg-white shadow-md hover:shadow-xl transition border border-[#E6F0FA] focus:outline-none focus:ring-2 focus:ring-[#003087]"
      onClick={handleClick}
      tabIndex={0}
      role="button"
      onKeyDown={e => (e.key === "Enter" ? handleClick() : undefined)}
      title={curso.nombre}
      style={{ minWidth: 220, maxWidth: 260 }}
    >
      <div className="rounded-full bg-white shadow-lg border-4 border-[#00B7EB] w-28 h-28 flex items-center justify-center mb-3 transition group-hover:shadow-2xl group-hover:scale-105">
        {curso.imagen ? (
          <Image
            src={curso.imagen}
            alt={curso.nombre}
            width={80}
            height={80}
            className="object-contain rounded-full"
          />
        ) : (
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
      <div className="text-center w-full">
        <span
          className="block text-lg font-semibold text-[#003087] break-words"
          style={{ wordBreak: "break-word" }}
        >
          {curso.nombre}
        </span>
        {curso.descripcion && (
          <span className="block text-xs text-gray-500 mt-1 break-words" style={{ wordBreak: "break-word" }}>
            {curso.descripcion}
          </span>
        )}
      </div>
    </div>
  );
}