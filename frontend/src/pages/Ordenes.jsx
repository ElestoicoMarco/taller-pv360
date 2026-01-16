import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MainLayout from '../components/Layout/MainLayout';
import { Wrench, Plus, Trash2, Save, X, AlertCircle } from 'lucide-react';

// URL del Backend (Render)
const API_URL = 'https://taller-pv360-c69q.onrender.com/api';

const Ordenes = () => {
  // Estados para datos
  const [ordenes, setOrdenes] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [servicios, setServicios] = useState([]);
  
  // Estados de interfaz
  const [modalAbierto, setModalAbierto] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Formulario
  const [form, setForm] = useState({ 
    id_ot: '', 
    id_cliente: '', 
    detalle: '', 
    total: '', 
    estado: 'Pendiente' 
  });

  // 1. CARGA DE DATOS (INDEPENDIENTE PARA EVITAR BLOQUEOS)
  useEffect(() => {
    const cargarDatos = async () => {
      setLoading(true);
      
      // A. CARGAR CLIENTES
      try {
        const res = await axios.get(`${API_URL}/clientes`);
        console.log("Clientes cargados:", res.data);
        setClientes(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.error("Error cargando clientes:", error);
      }

      // B. CARGAR CATÁLOGO (SERVICIOS)
      try {
        const res = await axios.get(`${API_URL}/servicios`);
        console.log("Catálogo cargado:", res.data);
        setServicios(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.error("Error cargando catálogo (Puede que el backend no esté actualizado):", error);
      }

      // C. CARGAR ÓRDENES
      try {
        const res = await axios.get(`${API_URL}/ordenes`);
        setOrdenes(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.error("Error cargando órdenes:", error);
      }
      
      setLoading(false);
    };

    cargarDatos();
  }, []);

  // 2. LÓGICA DEL CATÁLOGO (AUTO-COMPLETAR)
  const handleCatalogoChange = (e) => {
    const idSeleccionado = e.target.value;
    
    if (!idSeleccionado) return; // Si selecciona la opción vacía, no hace nada

    // Buscamos el servicio en el array (convertimos ID a número para comparar)
    const servicio = servicios.find(s => s.id_servicio == idSeleccionado);

    if (servicio) {
      setForm(prev => ({
        ...prev,
        detalle: servicio.nombre_servicio,  // Rellena descripción
        total: servicio.precio_base         // Rellena precio
      }));
    }
  };

  // 3. GUARDAR ORDEN
  const handleGuardar = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!form.id_cliente) {
      setErrorMsg("⚠️ Por favor, selecciona un cliente de la lista.");
      return;
    }

    try {
      await axios.post(`${API_URL}/ordenes`, {
        id_cliente: form.id_cliente,
        detalle: form.detalle,
        total_facturado: form.total || 0,
        estado: form.estado
      });
      alert("✅ Orden creada exitosamente");
      window.location.reload(); // Recargar para ver cambios
    } catch (error) {
      console.error(error);
      setErrorMsg("Error al guardar: " + (error.response?.data?.error || error.message));
    }
  };

  // 4. ELIMINAR ORDEN
  const handleEliminar = async (id) => {
    if (window.confirm("¿Seguro que deseas eliminar esta orden?")) {
      try {
        await axios.delete(`${API_URL}/ordenes/${id}`);
        // Actualizamos la lista localmente sin recargar toda la página
        setOrdenes(ordenes.filter(o => o.id_ot !== id));
      } catch (error) {
        alert("Error al eliminar");
      }
    }
  };

  return (
    <MainLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white flex gap-2">
            <Wrench className="text-orange-500"/> Gestión de Órdenes
        </h1>
        <button onClick={() => setModalAbierto(true)} className="bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-lg flex gap-2 font-bold shadow-lg shadow-orange-900/20 transition-all">
            <Plus/> Nueva Orden
        </button>
      </div>

      {/* TABLA DE ÓRDENES */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-xl h-[600px] overflow-hidden flex flex-col">
        <div className="overflow-auto flex-1">
            <table className="w-full text-left text-slate-400">
            <thead className="bg-slate-950 text-white uppercase text-xs font-bold sticky top-0 z-10">
                <tr>
                <th className="p-4 border-b border-slate-800">ID</th>
                <th className="p-4 border-b border-slate-800">Cliente</th>
                <th className="p-4 border-b border-slate-800">Detalle / Servicio</th>
                <th className="p-4 border-b border-slate-800">Estado</th>
                <th className="p-4 border-b border-slate-800 text-right">Total</th>
                <th className="p-4 border-b border-slate-800 text-center">Acciones</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
                {ordenes.map(ot => (
                <tr key={ot.id_ot} className="hover:bg-slate-800/50 transition-colors">
                    <td className="p-4 font-mono text-orange-400 font-bold">#{ot.id_ot}</td>
                    <td className="p-4 text-white font-medium">{ot.nombre_completo || 'Sin Cliente'}</td>
                    <td className="p-4">{ot.detalle}</td>
                    <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                            ot.estado === 'Pagada' ? 'bg-green-500/20 text-green-400' : 
                            ot.estado === 'En Progreso' ? 'bg-blue-500/20 text-blue-400' : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                            {ot.estado}
                        </span>
                    </td>
                    <td className="p-4 text-right text-white font-mono font-bold">${ot.total_facturado}</td>
                    <td className="p-4 text-center">
                        <button onClick={() => handleEliminar(ot.id_ot)} className="text-red-400 hover:bg-red-500/20 p-2 rounded transition-colors"><Trash2 size={18}/></button>
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
            {ordenes.length === 0 && !loading && (
                <div className="p-10 text-center text-slate-500">No hay órdenes registradas aún.</div>
            )}
        </div>
      </div>

      {/* MODAL DE NUEVA ORDEN */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 p-6 rounded-2xl w-full max-w-md border border-slate-700 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-white text-xl font-bold">Nueva Orden de Trabajo</h2>
                <button onClick={() => setModalAbierto(false)} className="text-slate-400 hover:text-white"><X/></button>
            </div>
            
            {errorMsg && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-200 p-3 rounded-lg mb-4 text-sm flex items-center gap-2">
                    <AlertCircle size={16}/> {errorMsg}
                </div>
            )}

            <form onSubmit={handleGuardar} className="space-y-4">
              
              {/* 1. SELECTOR CLIENTE */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Cliente *</label>
                <select 
                    className="w-full bg-slate-950 text-white p-3 rounded-lg border border-slate-700 focus:border-orange-500 outline-none transition-all"
                    value={form.id_cliente}
                    onChange={e => setForm({...form, id_cliente: e.target.value})}
                    required
                >
                  <option value="">-- Seleccionar Cliente --</option>
                  {clientes.map(c => (
                      <option key={c.id_cliente} value={c.id_cliente}>
                          {c.nombre_completo}
                      </option>
                  ))}
                </select>
                {clientes.length === 0 && <p className="text-xs text-red-400 mt-1">⚠️ No se cargaron clientes. Revisa tu conexión.</p>}
              </div>

              {/* 2. SELECTOR CATÁLOGO */}
              <div>
                <label className="text-xs font-bold text-blue-400 uppercase mb-1 block">Cargar desde Catálogo (Opcional)</label>
                <select 
                    className="w-full bg-slate-800 text-blue-200 p-3 rounded-lg border border-slate-700 focus:border-blue-500 outline-none transition-all"
                    onChange={handleCatalogoChange}
                    defaultValue=""
                >
                  <option value="">-- Seleccionar Servicio --</option>
                  {servicios.map(s => (
                      <option key={s.id_servicio} value={s.id_servicio}>
                          {s.nombre_servicio} - ${s.precio_base}
                      </option>
                  ))}
                </select>
              </div>

              {/* 3. DETALLE */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Detalle del Trabajo *</label>
                <textarea 
                    className="w-full bg-slate-950 text-white p-3 rounded-lg border border-slate-700 focus:border-orange-500 outline-none transition-all"
                    rows="3"
                    placeholder="Describe el trabajo a realizar..."
                    value={form.detalle} 
                    onChange={e => setForm({...form, detalle: e.target.value})} 
                    required 
                />
              </div>

              {/* 4. TOTAL Y ESTADO */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Total ($)</label>
                  <input 
                    type="number" 
                    className="w-full bg-slate-950 text-white p-3 rounded-lg border border-slate-700 focus:border-orange-500 outline-none"
                    value={form.total} 
                    onChange={e => setForm({...form, total: e.target.value})}
                  />
                </div>
                <div>
                   <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Estado</label>
                   <select 
                    className="w-full bg-slate-950 text-white p-3 rounded-lg border border-slate-700 focus:border-orange-500 outline-none"
                    value={form.estado}
                    onChange={e => setForm({...form, estado: e.target.value})}
                   >
                     <option value="Pendiente">Pendiente</option>
                     <option value="En Progreso">En Progreso</option>
                     <option value="Pagada">Pagada</option>
                     <option value="Entregado">Entregado</option>
                   </select>
                </div>
              </div>

              <div className="pt-4">
                <button type="submit" className="w-full bg-orange-600 hover:bg-orange-500 text-white p-3 rounded-lg font-bold shadow-lg shadow-orange-900/30 transition-all active:scale-95 flex justify-center gap-2">
                    <Save size={20}/> Guardar Orden
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default Ordenes;