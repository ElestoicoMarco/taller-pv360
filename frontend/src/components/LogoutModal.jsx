import React from 'react';
import { LogOut, X, AlertTriangle } from 'lucide-react';

const LogoutModal = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl w-full max-w-sm shadow-2xl scale-100 transform transition-all">

                {/* Encabezado con icono */}
                <div className="flex flex-col items-center mb-6 text-center">
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4 border border-red-500/20">
                        <AlertTriangle className="text-red-500" size={32} />
                    </div>
                    <h2 className="text-white text-xl font-bold">¿Cerrar Sesión?</h2>
                    <p className="text-slate-400 text-sm mt-2">
                        Tendrás que ingresar tu código de acceso nuevamente para volver al sistema.
                    </p>
                </div>

                {/* Botones de Acción */}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold shadow-lg shadow-red-900/20 flex items-center justify-center gap-2 transition-colors"
                    >
                        <LogOut size={18} /> Confirmar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LogoutModal;
