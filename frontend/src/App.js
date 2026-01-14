import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

// Importamos las páginas
import Dashboard from './pages/Dashboard';
import Clientes from './pages/Clientes'; // <--- NUEVO IMPORT

function App() {
  // Mantenemos tu lógica de autenticación aquí
  const [isAuth, setIsAuth] = useState(false);
  const [code, setCode] = useState('');

  // Función simple de login
  const handleLogin = (e) => {
    e.preventDefault();
    if (code === 'JUJUY2025') {
      setIsAuth(true);
    } else {
      alert("Código incorrecto");
    }
  };

  // Si NO está autenticado, mostramos la pantalla de login (Estilo Dark)
  if (!isAuth) {
    return (
      <div className="h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 p-8 md:p-10 rounded-3xl shadow-2xl w-full max-w-sm text-center">
          <div className="bg-blue-900/20 w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6">
            <ShieldCheck className="text-blue-500 w-10 h-10" />
          </div>
          <h1 className="text-white text-3xl font-bold mb-2">PV-360 PRO</h1>
          <p className="text-slate-400 text-sm mb-8">Acceso Administrativo Seguro</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="password" 
              placeholder="Código de Acceso" 
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-white text-center outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
              value={code} 
              onChange={e => setCode(e.target.value)} 
            />
            <button className="w-full bg-blue-600 text-white font-bold p-4 rounded-xl hover:bg-blue-500 transition-colors shadow-lg shadow-blue-900/30">
              INGRESAR AL SISTEMA
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Si está autenticado, mostramos el Router con las nuevas rutas
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        
        {/* Rutas nuevas agregadas */}
        <Route path="/clientes" element={<Clientes />} />
        <Route path="/reportes" element={<div className="text-white p-10 font-bold text-xl">🚧 Página de Reportes en construcción...</div>} />
        
        {/* Redirección por defecto */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;