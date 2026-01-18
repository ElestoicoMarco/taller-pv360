import React from 'react';
import { CheckCircle } from 'lucide-react';

const SuccessMessage = () => {
    return (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300">
            <div className="bg-emerald-500/20 p-6 rounded-full mb-6 border border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.3)] animate-pulse">
                <CheckCircle size={64} className="text-emerald-400" strokeWidth={3} />
            </div>

            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
                ¡ACCESO CONCEDIDO!
            </h1>
            <p className="text-slate-400 font-medium text-lg">
                Bienvenido al Sistema PV-360 PRO
            </p>

            <div className="mt-8 flex gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></span>
            </div>
        </div>
    );
};

export default SuccessMessage;
