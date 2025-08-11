"use client";

import CourseSidebar from "./components/CourseSidebar";
import React from "react";

export default function CourseLayout({ children, params }: { children: React.ReactNode, params: { cursoId: string } }) {
  return (
    <div className="flex min-h-screen bg-[#f4f8fb]">
      {/* Sidebar */}
      <CourseSidebar cursoId={params.cursoId} />
      {/* Main content */}
      <main className="flex-1 p-4 md:p-8">{children}</main>
    </div>
  );
}