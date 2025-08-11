"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdminSidebar from "@/components/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#F4F8FB] w-full">
      <Navbar />
      <div className="flex flex-1 w-full max-w-screen-2xl mx-auto pt-4 pb-4 px-2">
        {/* Sidebar con ancho fijo */}
        <div className="w-64 flex-shrink-0">
          <AdminSidebar />
        </div>
        {/* Contenido principal ocupa el resto */}
        <main className="flex-1 min-h-[calc(100vh-80px)]">{children}</main>
      </div>
      <Footer />
    </div>
  );
}