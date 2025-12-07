"use client";

import { useEffect, useState } from "react";
import { getUsuarioActual } from "@/services/usuarios";
import ProtectedRoute from "@/components/ProtectedRoute";
import Link from "next/link";
import type { Usuario } from "@/types";

export default function AdminDashboard() {
  const [user, setUser] = useState<Usuario | null>(null);
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
        <div className="text-xl font-semibold text-gray-600">Cargando...</div>
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["admin", "administrador"]} user={user}>
      <div className="w-full h-full p-6 md:p-10">

        {/* TÍTULO */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--color-primary)]">
            Panel de Administración
          </h1>
          <p className="subtitle mt-1">
            Gestiona usuarios, cursos e inscripciones desde un panel centralizado.
          </p>
        </div>

        {/* TARJETAS DE ACCESO DIRECTO */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          <Link href="/dashboard/admin/usuarios">
            <div className="card p-6 cursor-pointer hover:shadow-md transition">
              <h2 className="text-xl font-semibold text-[var(--color-primary)] mb-2">
                Gestión de Usuarios
              </h2>
              <p className="text-[var(--color-text-light)]">
                Crea, edita y administra los usuarios del sistema.
              </p>
            </div>
          </Link>

          <Link href="/dashboard/admin/inscripciones">
            <div className="card p-6 cursor-pointer hover:shadow-md transition">
              <h2 className="text-xl font-semibold text-[var(--color-primary)] mb-2">
                Inscripción de Estudiantes
              </h2>
              <p className="text-[var(--color-text-light)]">
                Inscribe estudiantes de forma rápida y eficiente.
              </p>
            </div>
          </Link>

          <Link href="/dashboard/admin/cursos">
            <div className="card p-6 cursor-pointer hover:shadow-md transition">
              <h2 className="text-xl font-semibold text-[var(--color-primary)] mb-2">
                Gestión de Cursos
              </h2>
              <p className="text-[var(--color-text-light)]">
                Administra cursos académicos y sus asignaciones.
              </p>
            </div>
          </Link>

        </div>
      </div>
    </ProtectedRoute>
  );
}
