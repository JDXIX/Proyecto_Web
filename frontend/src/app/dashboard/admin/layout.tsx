"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdminSidebar from "@/components/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg)] w-full">

      {/* NAVBAR */}
      <Navbar />

      {/* CONTENEDOR PRINCIPAL */}
      <div className="flex flex-1 w-full max-w-screen-2xl mx-auto px-4 py-6 gap-6">

        {/* SIDEBAR */}
        <aside className="w-64 flex-shrink-0">
          <AdminSidebar />
        </aside>

        {/* CONTENIDO */}
        <main className="flex-1 rounded-xl bg-white shadow-sm border border-[var(--color-border)] p-6">
          {children}
        </main>

      </div>

      {/* FOOTER */}
      <Footer />

    </div>
  );
}
