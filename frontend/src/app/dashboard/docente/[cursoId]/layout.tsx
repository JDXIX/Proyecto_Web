"use client";

import React from "react";
import { useParams } from "next/navigation";
import DocenteCourseSidebar from "../components/DocenteCourseSidebar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function DocenteCursoLayout({ children }: { children: React.ReactNode }) {
  // Obtiene el cursoId de la URL dinámica
  const params = useParams();
  const cursoId = Array.isArray(params?.cursoId) ? params.cursoId[0] : params?.cursoId;

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg)] w-full">
      {/* Navbar institucional */}
      <Navbar />

      {/* Contenido principal: sidebar + contenido */}
      <div className="flex flex-1 w-full max-w-6xl mx-auto py-8 px-4 md:px-8 gap-6 md:gap-8">
        {/* Sidebar de navegación del curso */}
        {cursoId && <DocenteCourseSidebar cursoId={cursoId as string} />}

        {/* Contenido principal del curso en una card */}
        <main className="flex-1 w-full bg-white rounded-2xl shadow-sm border border-[var(--color-border)] p-4 md:p-6">
          {children}
        </main>
      </div>

      {/* Footer institucional */}
      <Footer />
    </div>
  );
}
