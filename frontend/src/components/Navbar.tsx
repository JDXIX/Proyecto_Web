"use client";

import React from "react";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/");
  };

  return (
    <div className="fixed top-4 right-6 z-50">
      <button
        onClick={handleLogout}
        className="px-4 py-2 bg-white border border-[var(--color-border)] rounded-lg shadow-sm 
                   text-[var(--color-primary)] font-medium hover:bg-blue-50 transition"
      >
        Logout
      </button>
    </div>
  );
}
