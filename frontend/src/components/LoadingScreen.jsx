import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center overflow-hidden">
      {/* BACKGROUND BLOBS (To simulate depth behind the glass) */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-500/20 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-cyan-500/20 rounded-full blur-[120px] animate-pulse delay-700"></div>

      {/* GLASS LAYER */}
      <div className="absolute inset-0 bg-[#082f49]/5 backdrop-blur-xl border border-white/5"></div>

      {/* CONTENT */}
      <div className="relative z-10 flex flex-col items-center">
        <div className="relative">
          {/* Efecto de pulso en el fondo del icon */}
          <div className="absolute inset-0 bg-cyan-500/30 rounded-full blur-2xl animate-pulse"></div>
          {/* Icono Giratorio Central */}
          <Loader2 size={64} className="text-cyan-400 animate-spin relative z-10 drop-shadow-[0_0_15px_rgba(34,211,238,0.8)]" />
        </div>

        {/* Texto de Carga */}
        <h2 className="text-white text-xl font-bold mt-8 tracking-[0.2em] animate-pulse drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]">
          CARGANDO SISTEMA
        </h2>
        <div className="w-48 h-1 bg-slate-800 rounded-full mt-4 overflow-hidden relative">
          <div className="absolute top-0 left-0 h-full w-1/2 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-[shimmer_1.5s_infinite]"></div>
        </div>
        <p className="text-cyan-200/60 text-[10px] mt-2 font-mono uppercase tracking-widest">
          Por favor espere...
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;
