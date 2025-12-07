"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FiHome,
  FiBarChart2,
  FiMessageSquare,
  FiUsers,
  FiClock,
} from "react-icons/fi";

interface Props {
  cursoId: string;
}

export default function DocenteCourseSidebar({ cursoId }: Props) {
  const pathname = usePathname();

  const links = [
    {
      href: `/dashboard/docente/${cursoId}`,
      label: "Inicio",
      icon: <FiHome />,
    },
    {
      href: `/dashboard/docente/${cursoId}/reportes`,
      label: "Reportes",
      icon: <FiBarChart2 />,
    },
    {
      href: `/dashboard/docente/${cursoId}/historial`,
      label: "Historial",
      icon: <FiClock />,
    },
    {
      href: `/dashboard/docente/${cursoId}/estudiantes`,
      label: "Estudiantes",
      icon: <FiUsers />,
    },
  ];

  return (
    <aside className="w-72 bg-white border-r border-[var(--color-border)] p-6 flex flex-col min-h-screen shadow-sm">
      <div className="font-bold text-lg text-[var(--color-primary)] mb-6">
        Gestión de Curso
      </div>
      <nav className="flex-1 flex flex-col gap-2">
        {links.map((link) => {
          const active =
            pathname === link.href ||
            (link.href.endsWith("#estudiantes") &&
              pathname === `/dashboard/docente/${cursoId}`);

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition
                ${
                  active
                    ? "bg-blue-50 text-[var(--color-primary)]"
                    : "text-[var(--color-text)] hover:bg-blue-50"
                }`}
            >
              <span className="text-xl text-[var(--color-primary)]">
                {link.icon}
              </span>
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
