export default function Footer() {
  return (
    <footer className="w-full h-10 bg-[#D3D3D3] flex items-center justify-center text-gray-700 text-sm fixed bottom-0 left-0 z-40">
      <span>
        © {new Date().getFullYear()} JM Vision | 
        <a href="/privacidad" className="ml-2 text-[#003087] hover:underline">Política de privacidad</a> | 
        <a href="/contacto" className="ml-2 text-[#003087] hover:underline">Contacto</a>
      </span>
    </footer>
  );
}