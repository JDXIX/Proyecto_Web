"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiUsers, FiBookOpen, FiBarChart2 } from "react-icons/fi";

const links = [
  { href: "/dashboard/admin/usuarios", label: "Gestión de Usuarios", icon: <FiUsers /> },
  { href: "/dashboard/admin/inscripciones", label: "Inscripción de Estudiantes", icon: <FiBookOpen /> },
  { href: "/dashboard/admin/cursos", label: "Gestión de Cursos", icon: <FiBarChart2 /> },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full md:w-64 bg-white border-r border-[#E6F0FA] min-h-screen p-6">
      <nav className="flex flex-col gap-4">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-3 px-4 py-2 rounded-lg font-medium text-[#003087] hover:bg-[#E6F0FA] transition ${
              pathname.startsWith(link.href) ? "bg-[#D3F3FF] font-bold" : ""
            }`}
          >
            <span className="text-xl">{link.icon}</span>
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}