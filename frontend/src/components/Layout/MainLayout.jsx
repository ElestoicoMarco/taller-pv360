import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, FileText, Settings, Wrench, Menu } from 'lucide-react';

const MainLayout = ({ children }) => {
  const location = useLocation();

  // Función para saber si un botón está activo
  const isActive = (path) => location.pathname === path 
    ? "bg-blue-600 text-white shadow-lg shadow-blue-900/50" 
    : "text-slate-400 hover:bg-slate-800 hover:text-white";

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      
      {/* BARRA LATERAL (SIDEBAR) */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col hidden md:flex">
        
        {/* LOGO */}
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/30">
            PV
          </div>
          <h1 className="text-xl font-bold text-white tracking-wider">PV-360 <span className="text-blue-500">PRO</span></h1>
        </div>

        {/* MENÚ DE NAVEGACIÓN */}
        <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
          
          <div className="text-xs font-bold text-slate-600 uppercase px-4 py-2 mt-2">General</div>
          
          <Link to="/" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${isActive('/')}`}>
            <LayoutDashboard size={20} />
            Dashboard
          </Link>

          <Link to="/clientes" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${isActive('/clientes')}`}>
            <Users size={20} />
            Clientes
          </Link>

          {/* 👇 AQUÍ ESTÁ EL NUEVO BOTÓN QUE FALTABA */}
          <Link to="/ordenes" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${isActive('/ordenes')}`}>
            <Wrench size={20} />
            Órdenes
          </Link>

          <Link to="/reportes" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${isActive('/reportes')}`}>
            <FileText size={20} />
            Reportes
          </Link>

          <div className="text-xs font-bold text-slate-600 uppercase px-4 py-2 mt-6">Sistema</div>

          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all duration-200 font-medium">
            <Settings size={20} />
            Configuración
          </button>

        </nav>

        {/* PIE DE MENÚ */}
        <div className="p-4 border-t border-slate-800">
          <div className="bg-slate-800/50 rounded-xl p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500"></div>
            <div>
              <p className="text-white text-sm font-bold">Admin Taller</p>
              <p className="text-xs text-slate-500">Conectado</p>
            </div>
          </div>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 overflow-auto relative">
        {/* HEADER MÓVIL (Solo visible en celular) */}
        <div className="md:hidden p-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center sticky top-0 z-50">
           <h1 className="text-white font-bold">PV-360 PRO</h1>
           <button className="text-white"><Menu/></button>
        </div>

        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
