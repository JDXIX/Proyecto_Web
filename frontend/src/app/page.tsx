"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { login } from "@/services/auth";
import { getUsuarioActual } from "@/services/usuarios";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const data = await login(username, password);
      localStorage.setItem("token", data.access);

      const user = await getUsuarioActual(data.access);
      const rol = user.rol?.toLowerCase();

      if (rol === "admin" || rol === "docente" || rol === "estudiante") {
        router.push(`/dashboard/${rol}`);
      } else {
        router.push("/dashboard");
      }
    } catch (error: unknown) {
      setError("Usuario o contraseña incorrectos.");
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[var(--color-bg)] py-10">

      <div className="flex w-full max-w-5xl rounded-2xl shadow-lg overflow-hidden bg-white border border-[var(--color-border)]">

        {/* IZQUIERDA: Branding */}
        <div className="hidden md:flex w-1/2 flex-col justify-center px-12 bg-[var(--color-card)]">
          
          <div className="mb-6">
            <h1 className="text-4xl font-bold text-[var(--color-primary)]">AttentionTrack</h1>
            <p className="subtitle mt-2">
              Sistema Inteligente de Monitoreo de Atención Estudiantil
            </p>
          </div>

          <ul className="space-y-4 text-[var(--color-text-light)] text-sm">
            <li className="flex items-center gap-2">
              <span className="text-[var(--color-primary)] text-lg">👁️</span>
              Análisis por Visión por Computadora
            </li>
            <li className="flex items-center gap-2">
              <span className="text-[var(--color-primary)] text-lg">👥</span>
              Gestión Multi-Rol (Admin, Docente, Estudiante)
            </li>
            <li className="flex items-center gap-2">
              <span className="text-[var(--color-primary)] text-lg">📊</span>
              Métricas y Reportes Detallados
            </li>
          </ul>
        </div>

        {/* DERECHA: Formulario */}
        <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-10">

          <h2 className="text-3xl font-semibold text-[var(--color-text)] mb-2 text-center">
            Iniciar Sesión
          </h2>
          <p className="subtitle mb-6 text-center">
            Accede con tu cuenta para comenzar
          </p>

          <form className="w-full max-w-sm" onSubmit={handleSubmit} aria-label="Formulario de inicio de sesión">
            
            <label className="block mb-2 font-medium text-[var(--color-text)]" htmlFor="username">
              Correo Electrónico
            </label>

            <input
              id="username"
              type="text"
              className="w-full mb-4 px-4 py-2 border border-[var(--color-border)] rounded-lg 
                         focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-white"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              autoComplete="username"
            />

            <label className="block mb-2 font-medium text-[var(--color-text)]" htmlFor="password">
              Contraseña
            </label>

            <input
              id="password"
              type="password"
              className="w-full mb-2 px-4 py-2 border border-[var(--color-border)] rounded-lg 
                         focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-white"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />

            {error && <div className="text-[var(--color-error)] mb-3">{error}</div>}

            <button
              type="submit"
              className="btn-primary w-full h-11 mt-4 text-white text-base rounded-lg"
            >
              Iniciar Sesión
            </button>

            <button
              type="button"
              className="btn-ghost w-full h-11 mt-3 text-base rounded-lg border border-[var(--color-primary)]"
              onClick={() => router.push("/registro")}
            >
              Crear Cuenta
            </button>

            <div className="text-center mt-3">
              <button
                type="button"
                className="text-[var(--color-primary)] text-sm hover:underline bg-transparent cursor-pointer"
              >
                Olvidé mi contraseña
              </button>
            </div>
          </form>
        </div>

      </div>

    </div>
  );
}
