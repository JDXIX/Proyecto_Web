"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function DocenteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-[#F9FAFB] w-full">
      {/* Navbar global */}
      <Navbar />

      {/* Contenido principal con buen padding y centrado */}
      <main className="flex-1 w-full h-full px-4 md:px-8 py-6 md:py-8 max-w-screen-xl mx-auto flex flex-col">
        {children}
      </main>

      {/* Footer institucional */}
      <Footer />
    </div>
  );
}
