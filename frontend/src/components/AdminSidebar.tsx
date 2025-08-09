"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaUsers, FaBook, FaUserCheck } from "react-icons/fa";

const menu = [
  {
    label: "Gestión de Usuarios",
    href: "/dashboard/admin/usuarios",
    icon: <FaUsers className="inline mr-2" />,
  },
  {
    label: "Inscripción de Estudiantes",
    href: "/dashboard/admin/inscripciones",
    icon: <FaUserCheck className="inline mr-2" />,
  },
  {
    label: "Gestión de Cursos",
    href: "/dashboard/admin/cursos",
    icon: <FaBook className="inline mr-2" />,
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white shadow-lg flex flex-col min-h-screen">
      <div className="px-6 py-8 border-b border-gray-200">
        <Link href="/dashboard/admin">
          <span className="text-2xl font-bold text-[#003087] cursor-pointer">Panel Admin</span>
        </Link>
      </div>
      <nav className="flex-1 px-4 py-6">
        <ul className="space-y-2">
          {menu.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                  pathname.startsWith(item.href)
                    ? "bg-[#003087] text-white"
                    : "text-[#003087] hover:bg-[#e6f0fa]"
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}