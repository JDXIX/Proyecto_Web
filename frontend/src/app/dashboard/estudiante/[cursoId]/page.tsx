"use client";

import ResourceViewer from "./components/ResourceViewer";

export default function CursoPage({ params }: { params: { cursoId: string } }) {
  return (
    <div className="w-full h-full flex flex-col">
      {/* El sidebar ya está en el layout, aquí solo va el panel principal */}
      <ResourceViewer cursoId={params.cursoId} />
    </div>
  );
}