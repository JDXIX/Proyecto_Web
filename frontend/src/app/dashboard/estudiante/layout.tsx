"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function EstudianteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#F4F8FB] w-full">
      {/* Header institucional */}
      <header className="bg-[#003087] text-white shadow w-full">
        <div className="flex items-center justify-between px-6 py-4 w-full">
          <div className="flex items-center gap-4">
            <img
              src="/logo-jmvision.png"
              alt="Logo"
              className="h-10 w-10 rounded-full bg-white p-1"
            />
            <span className="text-2xl font-bold tracking-wide">Panel Estudiante</span>
          </div>
        </div>
      </header>

      {/* Contenido principal ocupa todo el ancho y alto */}
      <main className="flex-1 w-full h-full px-0 py-0 flex flex-col">
        {children}
      </main>

      {/* Footer institucional */}
      <Footer />
    </div>
  );
}