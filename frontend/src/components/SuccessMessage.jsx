import React from 'react';
import { CheckCircle, ShieldCheck } from 'lucide-react';

const SuccessMessage = () => {
    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden">
            {/* FONDO PREMIUM CON GRADIENTE RADIAL */}
            <div className="absolute inset-0 bg-slate-950 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black"></div>

            {/* PATRÓN DE PUNTOS SUTIL (EFECTO TECH) */}
            <div className="absolute inset-0 opacity-20" style={{
                backgroundImage: 'radial-gradient(#334155 1px, transparent 1px)',
                backgroundSize: '24px 24px'
            }}></div>

            {/* BRILLO AMBIENTAL VERDE/AZULADO */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none"></div>

            {/* CONTENIDO PRINCIPAL */}
            <div className="relative z-10 flex flex-col items-center animate-in fade-in zoom-in duration-500 slide-in-from-bottom-4">

                {/* ÍCONO CON EFECTO NEÓN MEJORADO */}
                <div className="relative mb-8 group">
                    <div className="absolute inset-0 bg-emerald-500 blur-xl opacity-40 group-hover:opacity-60 transition-opacity duration-500 animate-pulse"></div>
                    <div className="bg-slate-900/50 backdrop-blur-xl p-6 rounded-full border border-emerald-500/50 shadow-[0_0_40px_rgba(16,185,129,0.2)] ring-1 ring-white/10 relative">
                        <ShieldCheck size={72} className="text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.8)]" strokeWidth={2} />
                    </div>
                    {/* Partículas decorativas (burbujas) */}
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full animate-ping opacity-50"></div>
                </div>

                <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 mb-3 tracking-tight drop-shadow-sm">
                    ¡ACCESO CONCEDIDO!
                </h1>

                <p className="text-slate-400 font-medium text-lg md:text-xl tracking-wide">
                    Bienvenido al Sistema <span className="text-slate-200 font-bold">PV-360 PRO</span>
                </p>

                {/* INDICADOR DE CARGA DE ALTA TECNOLOGÍA */}
                <div className="mt-10 flex items-center gap-1">
                    <div className="h-1 bg-gradient-to-r from-emerald-500 to-cyan-500 w-32 rounded-full relative overflow-hidden">
                        <div className="absolute inset-0 bg-white/50 w-full -translate-x-full animate-[shimmer_1.5s_infinite]"></div>
                    </div>
                </div>
                <p className="text-emerald-500/60 text-xs font-mono mt-2 animate-pulse">
                    INICIALIZANDO MÓDULOS...
                </p>
            </div>
        </div>
    );
};

export default SuccessMessage;
