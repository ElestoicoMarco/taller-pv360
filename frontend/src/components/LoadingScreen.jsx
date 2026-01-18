import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center transition-all">
      <div className="relative">
        {/* Efecto de pulso en el fondo */}
        <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl animate-pulse"></div>
        
        {/* Icono Giratorio Central */}
        <Loader2 size={64} className="text-blue-500 animate-spin relative z-10" />
      </div>
      
      {/* Texto de Carga con efecto de parpadeo suave */}
      <h2 className="text-white text-xl font-bold mt-6 tracking-widest animate-pulse">
        CARGANDO SISTEMA
      </h2>
      <p className="text-slate-400 text-xs mt-2 font-mono">
        Por favor espere...
      </p>
    </div>
  );
};

export default LoadingScreen;
