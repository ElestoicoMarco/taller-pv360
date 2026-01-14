import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, FileText, Settings, LogOut } from 'lucide-react';

const Sidebar = () => {
  const location = useLocation(); // Para saber en qué página estamos

  return (
    <div className="h-screen w-64 bg-slate-900 text-white flex flex-col shadow-2xl shrink-0">
      {/* Logo */}
      <div className="p-6 flex items-center border-b border-slate-800">
        <span className="text-2xl font-bold text-blue-500">PV-360</span>
        <span className="text-2xl font-bold text-white ml-1">PRO</span>
      </div>

      {/* Menú */}
      <nav className="flex-1 p-4 space-y-2">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">General</div>
        
        {/* Usamos LINK para navegar */}
        <SidebarItem to="/" icon={<LayoutDashboard size={20} />} text="Dashboard" active={location.pathname === '/'} />
        <SidebarItem to="/clientes" icon={<Users size={20} />} text="Clientes" active={location.pathname === '/clientes'} />
        <SidebarItem to="/reportes" icon={<FileText size={20} />} text="Reportes" active={location.pathname === '/reportes'} />
        
        <div className="mt-8 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Sistema</div>
        <SidebarItem to="/config" icon={<Settings size={20} />} text="Configuración" active={location.pathname === '/config'} />
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button onClick={() => window.location.reload()} className="flex items-center space-x-3 text-slate-400 hover:text-red-400 transition-colors w-full p-2">
          <LogOut size={20} />
          <span>Salir</span>
        </button>
      </div>
    </div>
  );
};

// Componente de Botón modificado para aceptar "to" (Ruta)
const SidebarItem = ({ icon, text, active, to }) => {
  return (
    <Link to={to} className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all ${
      active 
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
    }`}>
      {icon}
      <span className="font-medium">{text}</span>
    </Link>
  );
};

export default Sidebar;