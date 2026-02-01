import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Save, Car, Trash2, ShieldCheck, Fuel } from 'lucide-react';

const VehiculosModal = ({ isOpen, onClose, clienteId, clienteNombre }) => {
    const [vehiculos, setVehiculos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingSave, setLoadingSave] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [editingId, setEditingId] = useState(null); // ID del vehículo en edición

    // Formulario Vehículo
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
            resetForm();
            setVehiculos([]);
        }
    }, [isOpen, clienteId]);

    const resetForm = () => {
        setForm({ marca: '', modelo: '', patente: '', vin: '', anio: new Date().getFullYear(), recurso: 'Nafta' });
        setErrorMsg('');
        setEditingId(null);
    };

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

    const handleEditar = (v) => {
        setEditingId(v.id_vehiculo);
        setForm({
            marca: v.marca,
            modelo: v.modelo,
            patente: v.patente,
            vin: v.vin_chasis || '',
            anio: v.anio,
            recurso: v.recurso || 'Nafta'
        });
        setErrorMsg('');
    };

    const handleGuardar = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setLoadingSave(true);

        try {
            if (editingId) {
                // EDITAR
                await axios.put(`https://taller-pv360-rejl.onrender.com/api/vehiculos/${editingId}`, form);
            } else {
                // CREAR
                await axios.post('https://taller-pv360-rejl.onrender.com/api/vehiculos', {
                    id_cliente: clienteId,
                    ...form
                });
            }

            resetForm();
            cargarVehiculos();
        } catch (error) {
            console.error("Error saving:", error);
            const serverError = error.response?.data?.error;
            const status = error.response?.status;
            setErrorMsg(serverError || `Error desconocido (${status || 'Red'}). Verifique su conexión.`);
        } finally {
            setLoadingSave(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-slate-900 rounded-2xl w-full max-w-5xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[95vh] relative">

                {/* Visualización del Auto (Dynamic Car Preview) */}
                <div className="absolute top-0 right-0 p-4 pointer-events-none opacity-20 z-0">
                    <Car size={300} className="text-slate-700" />
                </div>

                {/* COLUMNA IZQUIERDA: LISTA DE FLOTA */}
                <div className="md:w-1/3 p-6 border-b md:border-b-0 md:border-r border-slate-700 flex flex-col bg-slate-800/50 backdrop-blur-sm z-10">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h2 className="text-white text-xl font-bold flex items-center gap-2">
                                <Car className="text-orange-500" /> Flota del Cliente
                            </h2>
                            <p className="text-slate-400 text-sm">{clienteNombre}</p>
                        </div>
                    </div>

                    <div className="flex-1 overflow-auto pr-2 custom-scrollbar">
                        {loading ? (
                            <div className="text-center py-10 text-slate-500">Cargando flota...</div>
                        ) : vehiculos.length === 0 ? (
                            <div className="text-center py-10 bg-slate-800/50 rounded-xl border border-slate-700/50">
                                <Car size={40} className="mx-auto text-slate-600 mb-3" />
                                <p className="text-slate-400">Sin vehículos.</p>
                                <p className="text-slate-500 text-sm mt-1">Registra uno nuevo.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {vehiculos.map((v) => (
                                    <div
                                        key={v.id_vehiculo}
                                        onClick={() => handleEditar(v)}
                                        className={`p-4 rounded-xl border cursor-pointer transition-all group relative overflow-hidden ${editingId === v.id_vehiculo
                                            ? 'bg-blue-600/20 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                                            : 'bg-slate-800 border-slate-700 hover:border-blue-500/50 hover:bg-slate-700'
                                            }`}
                                    >
                                        <div className="relative z-10">
                                            <h3 className={`font-bold text-lg ${editingId === v.id_vehiculo ? 'text-blue-300' : 'text-white'}`}>
                                                {v.marca} {v.modelo}
                                            </h3>
                                            <p className="text-slate-400 text-sm mb-2">{v.anio}</p>

                                            <div className="flex flex-wrap gap-2 text-[10px] uppercase font-bold tracking-wider">
                                                <span className="bg-slate-950 px-2 py-1 rounded border border-slate-700 text-slate-300">
                                                    {v.patente}
                                                </span>
                                                <span className="bg-slate-950 px-2 py-1 rounded border border-slate-700 text-slate-300">
                                                    {v.recurso}
                                                </span>
                                            </div>
                                        </div>
                                        {/* Status Indicator */}
                                        {editingId === v.id_vehiculo && (
                                            <div className="absolute right-3 top-3 w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_10px_#3b82f6]"></div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* COLUMNA DERECHA: FORMULARIO */}
                <div className="flex-1 bg-slate-950 p-6 flex flex-col z-10 relative">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-white font-bold text-2xl flex items-center gap-2">
                            {editingId ? 'Editar Vehículo' : 'Agregar Vehículo'}
                        </h3>
                        <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition-colors">
                            <X size={24} />
                        </button>
                    </div>

                    {/* VISUALIZACIÓN 'ALADO' DE LOS CAMPOS (ENCIMA EN MOVIL, AL LADO EN DESKTOP SI HUBIERA ESPACIO PERO AQUI LO INTEGRO ARRIBA) 
                        El usuario pidió "Alado de los campos deberiamos visualizar el auto". 
                        Voy a crear una "tarjeta de previsualización" destacada.
                    */}
                    <div className="mb-6 bg-gradient-to-r from-slate-900 to-slate-800 p-4 rounded-xl border border-slate-700 flex items-center gap-6 shadow-lg">
                        <div className="w-20 h-20 rounded-full bg-slate-950 border-2 border-slate-700 flex items-center justify-center shadow-inner relative overflow-hidden group">
                            {/* Icono dinámico según recurso */}
                            <div className={`absolute inset-0 opacity-20 ${form.recurso === 'Nafta' ? 'bg-orange-500' : 'bg-green-500'}`}></div>
                            <Car size={40} className="text-slate-200 relative z-10" />
                        </div>
                        <div>
                            <h4 className="text-slate-400 text-xs uppercase font-bold tracking-widest mb-1">Previsualización</h4>
                            <p className="text-xl text-white font-bold">{form.marca || 'Marca'} {form.modelo || 'Modelo'}</p>
                            <div className="flex gap-3 text-sm text-slate-400 mt-1">
                                <span>{form.patente || '--- ---'}</span>
                                <span>•</span>
                                <span>{form.anio}</span>
                                <span>•</span>
                                <span className={form.recurso === 'Nafta' ? 'text-orange-400' : 'text-green-400'}>{form.recurso}</span>
                            </div>
                        </div>
                    </div>

                    {errorMsg && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-300 p-3 rounded-lg mb-4 text-sm flex items-center gap-2">
                            <span className="font-bold">Error:</span> {errorMsg}
                        </div>
                    )}

                    <form onSubmit={handleGuardar} className="space-y-4 overflow-y-auto flex-1 pr-2 custom-scrollbar">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-cyan-500 uppercase mb-1.5 block">Marca</label>
                                <input className="w-full bg-slate-900 text-white p-3 rounded-xl border border-slate-800 text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all placeholder:text-slate-600"
                                    placeholder="Ej: Toyota" required
                                    value={form.marca} onChange={e => setForm({ ...form, marca: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-cyan-500 uppercase mb-1.5 block">Modelo</label>
                                <input className="w-full bg-slate-900 text-white p-3 rounded-xl border border-slate-800 text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all placeholder:text-slate-600"
                                    placeholder="Ej: Hilux" required
                                    value={form.modelo} onChange={e => setForm({ ...form, modelo: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-cyan-500 uppercase mb-1.5 block">Patente</label>
                                <input className="w-full bg-slate-900 text-white p-3 rounded-xl border border-slate-800 text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all placeholder:text-slate-600 font-mono to-uppercase"
                                    placeholder="AA123BB" required
                                    value={form.patente} onChange={e => setForm({ ...form, patente: e.target.value.toUpperCase() })}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-cyan-500 uppercase mb-1.5 block">Año</label>
                                <input type="number" className="w-full bg-slate-900 text-white p-3 rounded-xl border border-slate-800 text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all placeholder:text-slate-600"
                                    placeholder="2024" required
                                    value={form.anio} onChange={e => setForm({ ...form, anio: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-cyan-500 uppercase mb-1.5 block">VIN / Chasis</label>
                            <input className="w-full bg-slate-900 text-white p-3 rounded-xl border border-slate-800 text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all placeholder:text-slate-600 font-mono"
                                placeholder="17 caracteres..." required minLength={5}
                                value={form.vin} onChange={e => setForm({ ...form, vin: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="text-xs font-bold text-cyan-500 uppercase mb-1.5 block">Tipo de Recurso</label>
                            <select className="w-full bg-slate-900 text-white p-3 rounded-xl border border-slate-800 text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
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

                        <div className="flex gap-3 mt-6">
                            {editingId && (
                                <button type="button" onClick={resetForm} className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition-all">
                                    Cancelar
                                </button>
                            )}
                            <button type="submit" disabled={loadingSave}
                                className={`flex-1 p-3 rounded-xl font-bold shadow-lg text-white flex justify-center items-center gap-2 transition-all transform active:scale-95 ${editingId
                                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 shadow-blue-500/20'
                                    : 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 shadow-orange-500/20'
                                    }`}
                            >
                                {loadingSave ? 'Guardando...' : <><Save size={18} /> {editingId ? 'Guardar Cambios' : 'Registrar Vehículo'}</>}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default VehiculosModal;
