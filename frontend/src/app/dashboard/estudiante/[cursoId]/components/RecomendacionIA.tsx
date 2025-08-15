"use client";

import { useEffect, useState } from "react";
import { generarRecomendacionIA } from "@/services/ia";

interface Props {
  estudianteId: string;
  faseId: string;
  atencion: number;
  nota: number;
}

export default function RecomendacionIA({ estudianteId, faseId, atencion, nota }: Props) {
  const [recomendacion, setRecomendacion] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!estudianteId || !faseId) return;
    const token = localStorage.getItem("token");
    if (!token) return;
    setLoading(true);
    setError(null);
    generarRecomendacionIA(estudianteId, faseId, atencion, nota, token)
      .then(setRecomendacion)
      .catch(() => setError("No se pudo generar la recomendación."))
      .finally(() => setLoading(false));
  }, [estudianteId, faseId, atencion, nota]);

  if (loading) return <div className="mt-4">Generando recomendación IA...</div>;
  if (error) return <div className="mt-4 text-red-600">{error}</div>;
  if (!recomendacion) return null;

  return (
    <div className="bg-blue-50 p-4 rounded mt-4">
      <div className="font-bold text-blue-800 mb-2">Recomendación IA</div>
      <div>{recomendacion.mensaje}</div>
      {Array.isArray(recomendacion.acciones) && (
        <ul className="mt-2 list-disc ml-5">
          {recomendacion.acciones.map((a: any, i: number) => (
            <li key={i}>{a.descripcion}</li>
          ))}
        </ul>
      )}
    </div>
  );
}