import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 w-full h-16 bg-[#003087] flex items-center justify-between px-8 z-50 shadow">
      <div className="flex items-center space-x-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="bg-white rounded-lg p-1 flex items-center justify-center shadow-md">
            <Image
              src="/logo-jmvision.png"
              alt="JM Vision"
              width={40}   // Aumenta el tamaño del logo aquí
              height={48}
              style={{ objectFit: "contain" }}
              priority
            />
          </div>
          <span className="text-white text-xl font-bold tracking-wide">JM Vision</span>
        </Link>
        <Link href="/dashboard" className="text-white hover:text-[#00B7EB] transition">Dashboard</Link>
        <Link href="/reportes" className="text-white hover:text-[#00B7EB] transition">Reportes</Link>
        <Link href="/perfil" className="text-white hover:text-[#00B7EB] transition">Perfil</Link>
      </div>
      <Link href="/logout" className="text-white hover:text-[#28A745] transition font-semibold">
        Logout
      </Link>
    </nav>
  );
}