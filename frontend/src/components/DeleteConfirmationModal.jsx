import React from 'react';
import { Trash2, AlertOctagon, X } from 'lucide-react';

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, itemName }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[60] flex items-center justify-center animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-red-500/30 p-0 rounded-2xl w-full max-w-sm shadow-2xl shadow-red-900/20 transform scale-100 transition-all overflow-hidden relative">

                {/* Barra superior de peligro */}
                <div className="h-2 bg-gradient-to-r from-red-600 via-orange-500 to-red-600 w-full"></div>

                <div className="p-6 text-center relative z-10">
                    {/* Círculo animado de fondo */}
                    <div className="absolute top-10 left-1/2 -translate-x-1/2 w-24 h-24 bg-red-500/10 rounded-full blur-xl -z-10"></div>

                    <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4 mx-auto border-2 border-red-500/20 shadow-inner">
                        <Trash2 className="text-red-500" size={32} />
                    </div>

                    <h2 className="text-white text-xl font-bold mb-2">¿Eliminar Registro?</h2>

                    <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                        Estás a punto de eliminar a <span className="text-white font-bold block mt-1 text-base">"{itemName}"</span>
                        Esta acción es irreversible.
                    </p>

                    {/* Botones */}
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition-colors border border-slate-700"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={onConfirm}
                            className="px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-lg shadow-red-900/30 flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95"
                        >
                            <AlertOctagon size={18} /> Eliminar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmationModal;
