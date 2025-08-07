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

    // Obtener el usuario actual y su rol
    const user = await getUsuarioActual(data.access);
    const rol = user.rol?.toLowerCase(); // admin, docente, estudiante

    if (rol === "admin" || rol === "docente" || rol === "estudiante") {
      router.push(`/dashboard/${rol}`);
    } else {
      router.push("/dashboard");
    }
  } catch (err: any) {
    setError("Usuario o contraseña incorrectos.");
  }
};

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-white">
      <div className="flex w-full max-w-4xl rounded-lg shadow-md overflow-hidden bg-white border border-[#D3D3D3]">
        {/* Columna formulario */}
        <div className="w-full md:w-1/3 flex flex-col justify-center items-center p-8 bg-white">
          <h1 className="text-2xl font-bold text-[#003087] mb-2 text-center">JM Vision</h1>
          <p className="text-[#003087] text-lg mb-6 text-center font-medium">¡Bienvenido de nuevo! Inicia sesión en tu cuenta.</p>
          <form className="w-full max-w-xs" onSubmit={handleSubmit} aria-label="Formulario de inicio de sesión">
            <label className="block text-black mb-2 font-semibold" htmlFor="username">
              Correo Electrónico
            </label>
            <input
              id="username"
              type="text"
              className="w-full mb-4 px-3 py-2 border border-[#D3D3D3] rounded focus:outline-none focus:ring-2 focus:ring-[#00B7EB]"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              autoComplete="username"
            />
            <label className="block text-black mb-2 font-semibold" htmlFor="password">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              className="w-full mb-2 px-3 py-2 border border-[#D3D3D3] rounded focus:outline-none focus:ring-2 focus:ring-[#00B7EB]"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            {error && <div className="text-red-600 mb-2">{error}</div>}
            <div className="flex space-x-4 mt-4 mb-2">
              <button
                type="submit"
                className="w-36 h-10 bg-[#003087] text-white font-semibold rounded hover:bg-[#002060] focus:ring-2 focus:ring-[#00B7EB] transition"
              >
                Ingresar
              </button>
              <button
                type="button"
                className="w-28 h-10 border border-[#00B7EB] text-[#00B7EB] font-semibold rounded hover:bg-[#F4F8FB] focus:ring-2 focus:ring-[#00B7EB] transition"
                onClick={() => router.push("/registro")}
              >
                Registrar
              </button>
            </div>
            <div className="text-center mt-2">
              <a href="/olvide-password" className="text-[#00B7EB] text-sm hover:underline">
                Olvidé mi contraseña
              </a>
            </div>
          </form>
        </div>
        {/* Columna imagen */}
        <div className="hidden md:flex w-2/3 items-center justify-center bg-white border-l border-[#D3D3D3] p-0">
          <Image
            src="/login-image.jpg"
            alt="Estudiantes en aula"
            width={800}
            height={600}
            className="object-cover w-full h-full"
            priority
          />
        </div>
      </div>
    </div>
  );
}