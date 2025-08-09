"use client";

import { useEffect, useState } from "react";
import { getUsuarioActual } from "@/services/usuarios";
import ProtectedRoute from "@/components/ProtectedRoute";
import Link from "next/link";

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      getUsuarioActual(token)
        .then(userData => setUser(userData))
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl font-semibold">Cargando...</div>
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["admin", "administrador"]} user={user}>
      <div className="p-8 w-full max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-[#003087] mb-6">Panel de Administrador</h1>
        <p className="mb-8 text-lg text-gray-700">
          Bienvenido al panel de administración. Selecciona una sección del menú lateral para gestionar usuarios, cursos o inscripciones.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/dashboard/admin/usuarios">
            <div className="bg-white rounded-lg shadow p-6 hover:bg-[#e6f0fa] cursor-pointer transition">
              <h2 className="text-xl font-semibold text-[#003087] mb-2">Gestión de Usuarios</h2>
              <p className="text-gray-600">Crea, edita y elimina usuarios del sistema.</p>
            </div>
          </Link>
          <Link href="/dashboard/admin/inscripciones">
            <div className="bg-white rounded-lg shadow p-6 hover:bg-[#e6f0fa] cursor-pointer transition">
              <h2 className="text-xl font-semibold text-[#003087] mb-2">Inscripción de Estudiantes</h2>
              <p className="text-gray-600">Inscribe estudiantes a cursos de forma individual o masiva.</p>
            </div>
          </Link>
          <Link href="/dashboard/admin/cursos">
            <div className="bg-white rounded-lg shadow p-6 hover:bg-[#e6f0fa] cursor-pointer transition">
              <h2 className="text-xl font-semibold text-[#003087] mb-2">Gestión de Cursos</h2>
              <p className="text-gray-600">Crea, edita y elimina cursos académicos.</p>
            </div>
          </Link>
        </div>
      </div>
    </ProtectedRoute>
  );
}