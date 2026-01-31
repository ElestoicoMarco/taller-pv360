import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Save, Car, Trash2, ShieldCheck, Fuel } from 'lucide-react';

const VehiculosModal = ({ isOpen, onClose, clienteId, clienteNombre }) => {
    const [vehiculos, setVehiculos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingSave, setLoadingSave] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    // Formulario Nuevo Vehículo
    const [form, setForm] = useState({
        marca: '',
        modelo: '',
        patente: '',
        vin: '',
        anio: new Date().getFullYear(),
        recurso: 'Nafta'
    });

    // Cargar flota al abrir modal
    useEffect(() => {
        if (isOpen && clienteId) {
            cargarVehiculos();
        } else {
            setVehiculos([]); // Limpiar al cerrar
            setForm({ marca: '', modelo: '', patente: '', vin: '', anio: new Date().getFullYear(), recurso: 'Nafta' });
            setErrorMsg('');
        }
    }, [isOpen, clienteId]);

    const cargarVehiculos = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`https://taller-pv360-rejl.onrender.com/api/vehiculos/cliente/${clienteId}`);
            setVehiculos(res.data);
        } catch (error) {
            console.error("Error cargando flota", error);
        } finally {
            setLoading(false);
        }
    };

    const handleGuardar = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setLoadingSave(true);

        try {
            await axios.post('https://taller-pv360-rejl.onrender.com/api/vehiculos', {
                id_cliente: clienteId,
                ...form
            });

            // Reset form y recargar lista
            setForm({ marca: '', modelo: '', patente: '', vin: '', anio: new Date().getFullYear(), recurso: 'Nafta' });
            cargarVehiculos();
        } catch (error) {
            setErrorMsg(error.response?.data?.error || "Error al registrar vehículo");
        } finally {
            setLoadingSave(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-slate-900 rounded-2xl w-full max-w-4xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]">

                {/* COLUMNA IZQUIERDA: LISTA DE FLOTA */}
                <div className="flex-1 p-6 border-b md:border-b-0 md:border-r border-slate-700 flex flex-col min-h-[400px]">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h2 className="text-white text-xl font-bold flex items-center gap-2">
                                <Car className="text-orange-500" /> Flota del Cliente
                            </h2>
                            <p className="text-slate-400 text-sm">{clienteNombre}</p>
                        </div>
                        {/* Solo cerrar en móvil aquí, escritorio tiene X global */}
                    </div>

                    <div className="flex-1 overflow-auto pr-2">
                        {loading ? (
                            <div className="text-center py-10 text-slate-500">Cargando flota...</div>
                        ) : vehiculos.length === 0 ? (
                            <div className="text-center py-10 bg-slate-800/50 rounded-xl border border-slate-700/50">
                                <Car size={40} className="mx-auto text-slate-600 mb-3" />
                                <p className="text-slate-400">Este cliente no tiene vehículos registrados.</p>
                                <p className="text-slate-500 text-sm mt-1">Utiliza el formulario para agregar uno.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {vehiculos.map((v) => (
                                    <div key={v.id_vehiculo} className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex justify-between items-center group hover:border-blue-500/50 transition-colors">
                                        <div>
                                            <h3 className="text-white font-bold text-lg">{v.marca} {v.modelo} <span className="text-slate-500 text-sm font-normal">({v.anio})</span></h3>
                                            <div className="flex items-center gap-4 mt-1 text-xs uppercase font-bold tracking-wider text-slate-400">
                                                <span className="bg-slate-900 px-2 py-1 rounded border border-slate-700">{v.patente}</span>
                                                <span className="flex items-center gap-1"><ShieldCheck size={12} /> {v.vin_chasis}</span>
                                                <span className="flex items-center gap-1 text-blue-400"><Fuel size={12} /> {v.recurso}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* COLUMNA DERECHA: FORMULARIO */}
                <div className="w-full md:w-[350px] bg-slate-950 p-6 flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-white font-bold">Agregar Vehículo</h3>
                        <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    {errorMsg && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-300 p-3 rounded-lg mb-4 text-xs">
                            {errorMsg}
                        </div>
                    )}

                    <form onSubmit={handleGuardar} className="space-y-3 overflow-y-auto flex-1 pr-1 custom-scrollbar">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Marca *</label>
                                <input className="w-full bg-slate-900 text-white p-2.5 rounded-lg border border-slate-800 text-sm focus:border-blue-500 outline-none"
                                    placeholder="Ej: Toyota" required
                                    value={form.marca} onChange={e => setForm({ ...form, marca: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Modelo *</label>
                                <input className="w-full bg-slate-900 text-white p-2.5 rounded-lg border border-slate-800 text-sm focus:border-blue-500 outline-none"
                                    placeholder="Ej: Hilux" required
                                    value={form.modelo} onChange={e => setForm({ ...form, modelo: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Patente *</label>
                                <input className="w-full bg-slate-900 text-white p-2.5 rounded-lg border border-slate-800 text-sm focus:border-blue-500 outline-none"
                                    placeholder="AA123BB" required
                                    value={form.patente} onChange={e => setForm({ ...form, patente: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Año *</label>
                                <input type="number" className="w-full bg-slate-900 text-white p-2.5 rounded-lg border border-slate-800 text-sm focus:border-blue-500 outline-none"
                                    placeholder="2024" required
                                    value={form.anio} onChange={e => setForm({ ...form, anio: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">VIN / Chasis *</label>
                            <input className="w-full bg-slate-900 text-white p-2.5 rounded-lg border border-slate-800 text-sm focus:border-blue-500 outline-none"
                                placeholder="17 caracteres..." required minLength={5}
                                value={form.vin} onChange={e => setForm({ ...form, vin: e.target.value })}
                            />
                            <p className="text-[10px] text-slate-600 mt-1">Obligatorio para identificar unidad única.</p>
                        </div>

                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Tipo de Recurso *</label>
                            <select className="w-full bg-slate-900 text-white p-2.5 rounded-lg border border-slate-800 text-sm focus:border-blue-500 outline-none"
                                value={form.recurso} onChange={e => setForm({ ...form, recurso: e.target.value })}
                            >
                                <option value="Nafta">Nafta</option>
                                <option value="Diesel">Diesel</option>
                                <option value="GNC">GNC</option>
                                <option value="Híbrido HEV">Híbrido (HEV)</option>
                                <option value="Híbrido PHEV">Híbrido Enchufable</option>
                                <option value="Eléctrico BEV">100% Eléctrico</option>
                            </select>
                        </div>

                        <button type="submit" disabled={loadingSave} className="w-full bg-orange-600 hover:bg-orange-500 text-white p-3 rounded-lg font-bold shadow-lg shadow-orange-900/20 active:scale-95 transition-all mt-4 flex justify-center items-center gap-2">
                            {loadingSave ? 'Guardando...' : <><Save size={16} /> Registrar Vehículo</>}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default VehiculosModal;
