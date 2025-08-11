"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiBookOpen, FiBarChart2, FiUpload, FiMessageSquare } from "react-icons/fi";

interface Props {
  cursoId: string;
}

export default function DocenteCourseSidebar({ cursoId }: Props) {
  const pathname = usePathname();

  const links = [
    { href: `/dashboard/docente/${cursoId}`, label: "Resumen", icon: <FiBookOpen /> },
    { href: `/dashboard/docente/${cursoId}/recursos`, label: "Recursos", icon: <FiUpload /> },
    { href: `/dashboard/docente/${cursoId}/reportes`, label: "Reportes", icon: <FiBarChart2 /> },
    { href: `/dashboard/docente/${cursoId}/recomendaciones`, label: "Recomendaciones IA", icon: <FiMessageSquare /> },
  ];

  return (
    <aside className="w-72 bg-white border-r border-[#E6F0FA] p-4 flex flex-col min-h-screen">
      <div className="font-bold text-lg text-[#003087] mb-6">Gestión de Curso</div>
      <nav className="flex-1 flex flex-col gap-2">
        {links.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-3 px-4 py-2 rounded-lg font-medium text-[#003087] hover:bg-[#E6F0FA] transition ${
              pathname === link.href ? "bg-[#D3F3FF] font-bold" : ""
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