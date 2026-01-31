import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ShieldCheck, AlertTriangle } from 'lucide-react';

// IMPORTAMOS LAS PÁGINAS DEL SISTEMA
import Dashboard from './pages/Dashboard';
import Clientes from './pages/Clientes';
import Reportes from './pages/Reportes';
import Ordenes from './pages/Ordenes'; // 👈 AQUÍ ESTÁ EL NUEVO MÓDULO
import SuccessMessage from './components/SuccessMessage';

function App() {
  // --- 🔒 ZONA DE SEGURIDAD (LOGIN) ---
  const [isAuth, setIsAuth] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (code === 'JUJUY2025') {
      // 1. Mostrar mensaje de éxito
      setShowSuccess(true);
      setError(''); // Limpiar errores

      // 2. Esperar un poco y luego entrar
      setTimeout(() => {
        setShowSuccess(false);
        setIsAuth(true);
      }, 2000); // 2 segundos de "placer visual"
    } else {
      setError("⛔ ACCESO DENEGADO: Código incorrecto");

      // Limpiar el error después de 3 segundos
      setTimeout(() => setError(''), 3000);
    }
  };

  // MOSTRAR MENSAJE DE ÉXITO SI CORRESPONDE
  if (showSuccess) return <SuccessMessage />;

  // SI NO ESTÁ AUTENTICADO -> MUESTRA PANTALLA DE BLOQUEO
  if (!isAuth) {
    return (
      <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-[#0a0a0a] text-slate-200 font-sans selection:bg-cyan-500/30">

        {/* --- FONDO ULTRA PREMIUM --- */}

        {/* 1. Gradiente Base Profundo */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#050505] to-black"></div>

        {/* 2. Grid Cyberpunk en Perspectiva (Sutil) */}
        <div className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)',
            backgroundSize: '30px 30px',
            maskImage: 'radial-gradient(circle at center, black 40%, transparent 100%)'
          }}>
        </div>

        {/* 3. Luces Ambientales "Vivas" */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-cyan-600/15 rounded-full blur-[120px] animate-pulse-slow delay-1000"></div>

        {/* 4. Partículas Flotantes (Efecto Polvo Digital) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400 rounded-full blur-[1px] animate-float opacity-40"></div>
          <div className="absolute top-3/4 left-1/3 w-1.5 h-1.5 bg-cyan-400 rounded-full blur-[1px] animate-float-delayed opacity-30"></div>
          <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-indigo-500 rounded-full blur-[2px] animate-float opacity-20"></div>
        </div>

        {/* --- TARJETA DE LOGIN CRISTAL --- */}
        <div className="relative z-10 w-full max-w-sm">
          {/* Efecto de borde brillante (Glow Border) */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-3xl blur opacity-30 animate-pulse-slow"></div>

          <div className="relative bg-black/40 backdrop-blur-2xl border border-white/10 p-8 md:p-10 rounded-3xl shadow-2xl">

            {/* Header */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-tr from-slate-800 to-slate-900 border border-slate-700/50 mb-6 shadow-inner group cursor-default shadow-lg shadow-black/50">
                <ShieldCheck className="text-cyan-400 w-10 h-10 group-hover:scale-110 group-hover:text-cyan-300 transition-all duration-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
              </div>
              <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 tracking-tight mb-2">
                PV-360 PRO
              </h1>
              <div className="flex items-center justify-center gap-2 text-xs font-semibold tracking-widest text-cyan-500/80 uppercase">
                <span className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></span>
                Sistema Seguro
                <span className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></span>
              </div>
            </div>

            {/* Formulario */}
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="relative group">
                <input
                  type="password"
                  placeholder="CÓDIGO DE ACCESO"
                  className={`w-full bg-slate-950/60 border ${error ? 'border-red-500 animate-shake' : 'border-slate-800'} rounded-xl px-4 py-4 text-center text-white placeholder:text-slate-600 tracking-[0.2em] focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all duration-300 group-hover:border-slate-700`}
                  value={code}
                  onChange={e => {
                    setCode(e.target.value);
                    if (error) setError('');
                  }}
                />
                {/* Indicador de foco activo */}
                <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-[1px] bg-cyan-500 transition-all duration-500 ${error ? 'w-0' : 'w-0 group-focus-within:w-2/3'}`}></div>
              </div>

              {/* Mensaje de error personalizado integrado */}
              {error && (
                <div className="flex items-center justify-center gap-3 animate-in fade-in slide-in-from-top-1 duration-300">
                  <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-2 rounded-lg backdrop-blur-md flex items-center gap-2 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                    <AlertTriangle size={14} className="animate-pulse" />
                    <span className="font-mono text-[10px] tracking-[0.2em] font-bold drop-shadow-sm uppercase">
                      {error}
                    </span>
                  </div>
                </div>
              )}

              <button className="relative w-full overflow-hidden group bg-slate-100 text-slate-950 font-bold p-4 rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                <span className="relative z-10 flex items-center justify-center gap-2">
                  DESBLOQUEAR
                </span>
              </button>

              <p className="text-center text-[10px] text-slate-600 uppercase tracking-widest mt-6">
                Taller PV-360 • Authentication
              </p>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // SI YA INGRESÓ -> MUESTRA EL SISTEMA COMPLETO
  return (
    <Router>
      <Routes>
        {/* PANTALLA PRINCIPAL */}
        <Route path="/" element={<Dashboard />} />

        {/* GESTIÓN DE CLIENTES */}
        <Route path="/clientes" element={<Clientes />} />

        {/* 🛠️ NUEVA SECCIÓN: ÓRDENES DE TRABAJO */}
        <Route path="/ordenes" element={<Ordenes />} />

        {/* REPORTES Y DOCUMENTACIÓN */}
        <Route path="/reportes" element={<Reportes />} />

        {/* CUALQUIER OTRA RUTA REDIRIGE AL INICIO */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;