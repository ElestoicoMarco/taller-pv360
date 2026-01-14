import React from 'react';
import Sidebar from './Sidebar';

const MainLayout = ({ children }) => {
  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      {/* Barra Lateral Fija */}
      <Sidebar />

      {/* Área de Contenido Principal */}
      <main className="flex-1 overflow-y-auto p-8 text-white">
        {/* Aquí se inyectará el contenido de tus páginas */}
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
