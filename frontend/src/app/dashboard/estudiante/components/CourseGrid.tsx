import React from "react";
import CourseCard from "./CourseCard";

interface CourseGridProps {
  cursos: any[];
}

export default function CourseGrid({ cursos }: CourseGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">
      {cursos.map((curso) => (
        <CourseCard key={curso.id} curso={curso} />
      ))}
    </div>
  );
}