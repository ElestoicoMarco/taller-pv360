import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

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

  const handleLogin = (e) => {
    e.preventDefault();
    if (code === 'JUJUY2025') {
      // 1. Mostrar mensaje de éxito
      setShowSuccess(true);

      // 2. Esperar un poco y luego entrar
      setTimeout(() => {
        setShowSuccess(false);
        setIsAuth(true);
      }, 2000); // 2 segundos de "placer visual"
    } else {
      alert("⛔ ACCESO DENEGADO: Código incorrecto");
    }
  };

  // MOSTRAR MENSAJE DE ÉXITO SI CORRESPONDE
  if (showSuccess) return <SuccessMessage />;

  // SI NO ESTÁ AUTENTICADO -> MUESTRA PANTALLA DE BLOQUEO
  if (!isAuth) {
    return (
      <div className="h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 p-8 md:p-10 rounded-3xl shadow-2xl w-full max-w-sm text-center">
          <div className="bg-blue-900/20 w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6">
            <ShieldCheck className="text-blue-500 w-10 h-10" />
          </div>
          <h1 className="text-white text-3xl font-bold mb-2">PV-360 PRO</h1>
          <p className="text-slate-400 text-sm mb-8">Sistema de Gestión Taller</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              placeholder="Ingrese Código de Acceso"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-white text-center outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              value={code}
              onChange={e => setCode(e.target.value)}
            />
            <button className="w-full bg-blue-600 text-white font-bold p-4 rounded-xl hover:bg-blue-500 transition-colors shadow-lg shadow-blue-900/30">
              DESBLOQUEAR SISTEMA
            </button>
          </form>
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