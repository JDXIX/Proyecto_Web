"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface Props {
  allowedRoles: string[];
  user: any;
  children: React.ReactNode;
}

export default function ProtectedRoute({ allowedRoles, user, children }: Props) {
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.replace("/"); // No autenticado, redirige al login
    } else if (!allowedRoles.includes(user.rol?.toLowerCase())) {
      // Autenticado pero rol incorrecto
      router.replace(`/dashboard/${user.rol?.toLowerCase()}`);
    }
  }, [user, allowedRoles, router]);

  // Si pasa la validación, muestra el contenido
  return <>{children}</>;
}