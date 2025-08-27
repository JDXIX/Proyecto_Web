import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "JM Vision",
  description: "Sistema de monitoreo de atención para educación superior",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased bg-white min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col w-full bg-[#F4F8FB] px-8 py-8 max-w-screen-2xl mx-auto">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}