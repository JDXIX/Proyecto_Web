"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { register } from "@/services/auth";

export default function RegistroPage() {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      // Siempre enviar rol en minúsculas
      await register({ ...form, rol: "estudiante", username: form.email });
      setSuccess("¡Registro exitoso! Ahora puedes iniciar sesión.");
      setTimeout(() => router.push("/"), 2000);
    } catch (error: unknown) {
      const err = error as { message?: string };
      setError(err?.message || "Error al registrar usuario.");
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[var(--color-bg)] py-10">
      <div className="flex w-full max-w-5xl rounded-2xl shadow-lg overflow-hidden bg-white border border-[var(--color-border)]">
        {/* IZQUIERDA: Branding (igual que login) */}
        <div className="hidden md:flex w-1/2 flex-col justify-center px-12 bg-[var(--color-card)]">
          <div className="mb-6">
            <h1 className="text-4xl font-bold text-[var(--color-primary)]">
              AttentionTrack
            </h1>
            <p className="subtitle mt-2">
              Sistema Inteligente de Monitoreo de Atención Estudiantil
            </p>
          </div>

          <ul className="space-y-4 text-[var(--color-text-light)] text-sm">
            <li className="flex items-center gap-2">
              <span className="text-[var(--color-primary)] text-lg">🎓</span>
              Registro rápido para nuevos estudiantes
            </li>
            <li className="flex items-center gap-2">
              <span className="text-[var(--color-primary)] text-lg">👁️</span>
              Monitoreo de atención en tiempo real
            </li>
            <li className="flex items-center gap-2">
              <span className="text-[var(--color-primary)] text-lg">📊</span>
              Reportes personalizados de rendimiento
            </li>
          </ul>
        </div>

        {/* DERECHA: Formulario de registro */}
        <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-10">
          <h2 className="text-3xl font-semibold text-[var(--color-text)] mb-2 text-center">
            Crear cuenta
          </h2>
          <p className="subtitle mb-6 text-center">
            Regístrate como estudiante para acceder a tus cursos y reportes.
          </p>

          <form
            className="w-full max-w-sm space-y-4"
            onSubmit={handleSubmit}
            aria-label="Formulario de registro"
          >
            <div>
              <label className="block mb-1 font-medium text-[var(--color-text)]">
                Nombre
              </label>
              <input
                type="text"
                name="first_name"
                value={form.first_name}
                onChange={handleChange}
                className="w-full border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm 
                           focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-white"
                required
              />
            </div>

            <div>
              <label className="block mb-1 font-medium text-[var(--color-text)]">
                Apellido
              </label>
              <input
                type="text"
                name="last_name"
                value={form.last_name}
                onChange={handleChange}
                className="w-full border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm 
                           focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-white"
                required
              />
            </div>

            <div>
              <label className="block mb-1 font-medium text-[var(--color-text)]">
                Correo electrónico
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm 
                           focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-white"
                required
              />
            </div>

            <div>
              <label className="block mb-1 font-medium text-[var(--color-text)]">
                Contraseña
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className="w-full border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm 
                           focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-white"
                required
              />
            </div>

            {error && (
              <div className="text-[var(--color-error)] text-sm">{error}</div>
            )}
            {success && (
              <div className="text-green-600 text-sm">{success}</div>
            )}

            <button
              type="submit"
              className="btn-primary w-full h-11 mt-2 text-base rounded-lg"
            >
              Registrarse
            </button>
          </form>

          <div className="mt-4 text-center text-sm">
            <span className="text-[var(--color-text-light)]">
              ¿Ya tienes cuenta?{" "}
            </span>
            <Link
              href="/"
              className="text-[var(--color-primary)] hover:underline font-semibold"
            >
              Inicia sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
