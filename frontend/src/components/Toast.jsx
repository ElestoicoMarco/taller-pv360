import React, { useEffect } from 'react';
import { CheckCircle, X } from 'lucide-react';

const Toast = ({ message, onClose, duration = 2000 }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    return (
        <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-right duration-300">
            <div className="bg-slate-900/90 backdrop-blur-md border border-emerald-500/30 text-white px-6 py-4 rounded-xl shadow-2xl shadow-emerald-900/20 flex items-center gap-4">
                <div className="bg-emerald-500/20 p-2 rounded-full">
                    <CheckCircle size={20} className="text-emerald-400" />
                </div>
                <div>
                    <h4 className="font-bold text-sm">Operación Exitosa</h4>
                    <p className="text-slate-400 text-xs">{message}</p>
                </div>
                <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors ml-2">
                    <X size={16} />
                </button>
            </div>
        </div>
    );
};

export default Toast;
