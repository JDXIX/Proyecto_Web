"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/"); // Redirige al login o landing page
  };

  return (
    <nav className="w-full bg-[#003087] text-white shadow flex items-center justify-between px-6 py-2 z-50 fixed top-0 left-0">
      <div className="flex items-center gap-4">
        <img
          src="/logo-jmvision.png"
          alt="JM Vision Logo"
          className="h-10 w-10 rounded-full bg-white p-1"
        />
        <span className="text-xl font-bold tracking-wide">JM Vision</span>
        <Link href="/dashboard/estudiante" className="ml-6 hover:underline">
          Dashboard
        </Link>
        <Link href="/dashboard/reportes" className="hover:underline">
          Reportes
        </Link>
        <Link href="/dashboard/perfil" className="hover:underline">
          Perfil
        </Link>
      </div>
      <button
        onClick={handleLogout}
        className="font-semibold hover:underline transition"
      >
        Logout
      </button>
    </nav>
  );
}