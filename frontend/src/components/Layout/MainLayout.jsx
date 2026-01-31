import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, FileText, Settings, Wrench, LogOut, Menu, X } from 'lucide-react';
import LogoutModal from '../LogoutModal';

const MainLayout = ({ children }) => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path
    ? "bg-blue-600 text-white shadow-lg"
    : "text-slate-400 hover:bg-slate-800 hover:text-white";

  // ESTADO DEL MODAL
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  // ESTADO DEL SIDEBAR
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // MANEJADORES
  const openLogoutModal = () => setShowLogoutModal(true);
  const closeLogoutModal = () => setShowLogoutModal(false);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const confirmLogout = () => {
    window.location.href = "/";
    window.location.reload();
  };

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden relative">

      {/* TOP GLASS HEADER (FIXED) */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 z-50 flex items-center px-4 justify-between shadow-lg md:hidden">
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className="p-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors border border-slate-700 shadow-sm"
            aria-label="Toggle Menu"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Logo visible only on mobile */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center font-bold text-white text-xs">PV</div>
            <span className="font-bold text-white text-sm">PV-360 <span className="text-blue-500">PRO</span></span>
          </div>
        </div>

        {/* User / Profile Section (Placeholder for future) */}
        <div className="text-slate-400 text-xs font-medium">
          v2.0 Beta
        </div>
      </header>

      {/* SIDEBAR COLAPSABLE (NEON GLASS STYLE - AZULADO) */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#082f49]/40 backdrop-blur-md border-r border-cyan-500/30 flex flex-col transition-transform duration-300 ease-in-out shadow-[0_0_15px_rgba(6,182,212,0.15),inset_0_0_30px_rgba(6,182,212,0.1)] pt-16 md:pt-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
      >

        {/* LOGO (Desktop) */}
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-cyan-500 rounded flex items-center justify-center font-bold text-black shadow-[0_0_10px_rgba(6,182,212,0.8)]">PV</div>
          <h1 className="text-xl font-bold text-white">PV-360 <span className="text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]">PRO</span></h1>
        </div>

        {/* MENÚ */}
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <Link to="/" onClick={() => setIsSidebarOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${location.pathname === '/' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.2)]' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
            <LayoutDashboard size={20} /> Dashboard
          </Link>
          <Link to="/clientes" onClick={() => setIsSidebarOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${location.pathname === '/clientes' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.2)]' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
            <Users size={20} /> Clientes
          </Link>
          <Link to="/ordenes" onClick={() => setIsSidebarOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${location.pathname === '/ordenes' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.2)]' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
            <Wrench size={20} /> Órdenes
          </Link>
          <Link to="/reportes" onClick={() => setIsSidebarOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${location.pathname === '/reportes' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.2)]' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
            <FileText size={20} /> Reportes
          </Link>
        </nav>

        {/* PIE DE MENÚ CON BOTÓN SALIR (NEON RED) */}
        <div className="p-4 border-t border-cyan-500/20">
          <button
            onClick={openLogoutModal}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 bg-red-500/5 border border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.15)] hover:bg-red-500/20 hover:shadow-[0_0_25px_rgba(239,68,68,0.4)] hover:text-red-400 transition-all font-bold group"
          >
            <LogOut size={20} className="group-hover:rotate-12 transition-transform drop-shadow-[0_0_5px_rgba(239,68,68,0.8)]" />
            <span className="drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]">CERRAR SESIÓN</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT (With padding-top for header) */}
      <main className="flex-1 overflow-auto p-4 md:p-8 w-full pt-20 md:pt-8 md:ml-64 transition-all">
        {children}
      </main>

      {/* OVERLAY PARA CERRAR AL CLICKERA AFUERA (OPCIONAL PERO RECOMENDADO) */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 backdrop-blur-sm md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* MODAL DE CONFIRMACIÓN */}
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={closeLogoutModal}
        onConfirm={confirmLogout}
      />
    </div>
  );
};
export default MainLayout;