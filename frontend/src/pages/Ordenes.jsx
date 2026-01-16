import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MainLayout from '../components/Layout/MainLayout';
import { Wrench, Plus, Edit, Trash2, Save, X } from 'lucide-react';

const API_URL = 'https://taller-pv360-c69q.onrender.com/api';

const Ordenes = () => {
  const [ordenes, setOrdenes] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [servicios, setServicios] = useState([]); // Nuevo: Catálogo
  const [modalAbierto, setModalAbierto] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Formulario
  const [form, setForm] = useState({ id_ot: '', id_cliente: '', detalle: '', total: '', estado: 'Pendiente' });
  
  // 1. CARGAR DATOS (Blindado y separado)
  const cargarTodo = async () => {
    setLoading(true);
    
    // A. Clientes
    try {
      const res = await axios.get(`${API_URL}/clientes`);
      setClientes(Array.isArray(res.data) ? res.data : []);
    } catch (e) { console.error("Error clientes", e); }

    // B. Servicios (Catálogo)
    try {
      const res = await axios.get(`${API_URL}/servicios`);
      setServicios(Array.isArray(res.data) ? res.data : []);
    } catch (e) { console.error("Error servicios", e); }

    // C. Órdenes (Datos reales)
    try {
      const res = await axios.get(`${API_URL}/ordenes`);
      setOrdenes(Array.isArray(res.data) ? res.data : []);
    } catch (e) { console.error("Error ordenes", e); }
    
    setLoading(false);
  };

  useEffect(() => { cargarTodo(); }, []);

  // AUTO-COMPLETAR AL ELEGIR SERVICIO
  const seleccionarServicio = (e) => {
    const idServicio = parseInt(e.target.value);
    const servicioElegido = servicios.find(s => s.id_servicio === idServicio);
    
    if (servicioElegido) {
      setForm({
        ...form,
        detalle: servicioElegido.nombre_servicio,
        total: servicioElegido.precio_base
      });
    }
  };

  // GUARDAR
  const handleGuardar = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/ordenes`, {
        id_cliente: form.id_cliente,
        detalle: form.detalle,
        total_facturado: form.total,
        estado: form.estado
      });
      setModalAbierto(false);
      cargarTodo();
      alert("✅ Orden creada con éxito");
    } catch (error) {
      alert("Error al guardar: " + (error.response?.data?.error || error.message));
    }
  };

  // ELIMINAR
  const handleEliminar = async (id) => {
    if(!window.confirm("¿Eliminar orden?")) return;
    try {
        await axios.delete(`${API_URL}/ordenes/${id}`);
        cargarTodo();
    } catch (error) { alert("Error al eliminar"); }
  };

  const abrirModal = () => {
    setForm({ id_ot: '', id_cliente: '', detalle: '', total: '', estado: 'Pendiente' });
    setModalAbierto(true);
  };

  return (
    <MainLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white flex gap-2"><Wrench className="text-orange-500"/> Órdenes de Trabajo</h1>
        <button onClick={abrirModal} className="bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded flex gap-2 font-bold">
          <Plus/> Nueva Orden
        </button>
      </div>

      {/* TABLA */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-xl h-[500px] overflow-y-auto">
        <table className="w-full text-left text-slate-400">
          <thead className="bg-slate-950 text-white uppercase text-xs font-bold sticky top-0">
            <tr>
              <th className="p-4">ID</th>
              <th className="p-4">Cliente</th>
              <th className="p-4">Servicio (Diagnóstico)</th>
              <th className="p-4">Estado</th>
              <th className="p-4 text-right">Total</th>
              <th className="p-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {ordenes.map(ot => (
              <tr key={ot.id_ot} className="hover:bg-slate-800">
                <td className="p-4 font-mono text-orange-400">#{ot.id_ot}</td>
                <td className="p-4 text-white font-bold">{ot.nombre_completo || 'Cliente Desconocido'}</td>
                <td className="p-4">{ot.detalle}</td>
                <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${ot.estado === 'Pagada' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                        {ot.estado}
                    </span>
                </td>
                <td className="p-4 text-right text-white font-mono">${ot.total_facturado}</td>
                <td className="p-4 text-center">
                    <button onClick={() => handleEliminar(ot.id_ot)} className="text-red-400 hover:bg-red-900/30 p-2 rounded"><Trash2 size={18}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL INTELIGENTE */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 p-6 rounded-xl w-full max-w-md border border-slate-700 shadow-2xl">
            <div className="flex justify-between mb-4">
                <h2 className="text-white text-xl font-bold">Nueva Orden</h2>
                <button onClick={() => setModalAbierto(false)} className="text-slate-400"><X/></button>
            </div>
            
            <form onSubmit={handleGuardar} className="space-y-4">
              
              {/* 1. SELECT CLIENTE */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Cliente</label>
                <select className="w-full bg-slate-950 text-white p-3 rounded border border-slate-700 mt-1"
                  value={form.id_cliente} onChange={e => setForm({...form, id_cliente: e.target.value})} required>
                  <option value="">-- Seleccionar --</option>
                  {clientes.map(c => <option key={c.id_cliente} value={c.id_cliente}>{c.nombre_completo}</option>)}
                </select>
              </div>

              {/* 2. SELECT SERVICIO (CATALOGO) */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Catálogo de Servicios (Opcional)</label>
                <select className="w-full bg-slate-800 text-blue-300 p-3 rounded border border-slate-700 mt-1"
                   onChange={seleccionarServicio} defaultValue="">
                  <option value="">-- Cargar desde Catálogo --</option>
                  {servicios.map(s => <option key={s.id_servicio} value={s.id_servicio}>{s.nombre_servicio} (${s.precio_base})</option>)}
                </select>
              </div>

              {/* 3. DETALLE MANUAL */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Detalle / Diagnóstico</label>
                <textarea className="w-full bg-slate-950 text-white p-3 rounded border border-slate-700 mt-1" rows="2"
                  value={form.detalle} onChange={e => setForm({...form, detalle: e.target.value})} required placeholder="Escriba el detalle..."/>
              </div>

              {/* 4. TOTAL Y ESTADO */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Total ($)</label>
                  <input type="number" className="w-full bg-slate-950 text-white p-3 rounded border border-slate-700 mt-1"
                    value={form.total} onChange={e => setForm({...form, total: e.target.value})}/>
                </div>
                <div>
                   <label className="text-xs font-bold text-slate-500 uppercase">Estado</label>
                   <select className="w-full bg-slate-950 text-white p-3 rounded border border-slate-700 mt-1"
                     value={form.estado} onChange={e => setForm({...form, estado: e.target.value})}>
                     <option value="Pendiente">Pendiente</option>
                     <option value="En Progreso">En Progreso</option>
                     <option value="Pagada">Pagada</option>
                   </select>
                </div>
              </div>

              <button type="submit" className="w-full bg-orange-600 hover:bg-orange-500 text-white p-3 rounded font-bold mt-4 flex justify-center gap-2">
                <Save size={20}/> Guardar Orden
              </button>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default Ordenes;