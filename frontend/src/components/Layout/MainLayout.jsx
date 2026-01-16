import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, FileText, Settings, Wrench, LogOut } from 'lucide-react';

const MainLayout = ({ children }) => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path 
    ? "bg-blue-600 text-white shadow-lg" 
    : "text-slate-400 hover:bg-slate-800 hover:text-white";

  // FUNCIÓN SALIR (Simplemente recarga para volver al login)
  const handleLogout = () => {
      if(window.confirm("¿Cerrar sesión?")) {
          window.location.href = "/";
          window.location.reload();
      }
  };

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col hidden md:flex">
        
        {/* LOGO */}
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-bold text-white">PV</div>
          <h1 className="text-xl font-bold text-white">PV-360 <span className="text-blue-500">PRO</span></h1>
        </div>

        {/* MENÚ */}
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <Link to="/" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium ${isActive('/')}`}>
            <LayoutDashboard size={20} /> Dashboard
          </Link>
          <Link to="/clientes" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium ${isActive('/clientes')}`}>
            <Users size={20} /> Clientes
          </Link>
          <Link to="/ordenes" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium ${isActive('/ordenes')}`}>
            <Wrench size={20} /> Órdenes
          </Link>
          <Link to="/reportes" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium ${isActive('/reportes')}`}>
            <FileText size={20} /> Reportes
          </Link>
        </nav>

        {/* PIE DE MENÚ CON BOTÓN SALIR */}
        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-900/20 transition-all font-bold"
          >
            <LogOut size={20} />
            CERRAR SESIÓN
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto p-8">
        {children}
      </main>
    </div>
  );
};
export default MainLayout;