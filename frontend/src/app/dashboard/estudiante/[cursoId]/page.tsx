"use client";

import ResourceViewer from "./components/ResourceViewer";

export default function CursoPage({ params }: { params: { cursoId: string } }) {
  return (
    <div className="w-full h-full">
      <ResourceViewer cursoId={params.cursoId} />
    </div>
  );
}