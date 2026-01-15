import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MainLayout from '../components/Layout/MainLayout';
import { Wrench, Plus, DollarSign, CheckCircle, Clock, Trash2, Edit } from 'lucide-react';

const API_URL = 'https://taller-pv360-c69q.onrender.com/api';

const Ordenes = () => {
  const [ordenes, setOrdenes] = useState([]);
  const [clientes, setClientes] = useState([]); // Para el desplegable
  const [modalAbierto, setModalAbierto] = useState(false);
  
  // Formulario
  const [form, setForm] = useState({ id_ot: '', id_cliente: '', detalle: '', total: '', estado: 'Pendiente' });
  const [modoEdicion, setModoEdicion] = useState(false);

  // 1. CARGAR DATOS (Clientes y Órdenes)
  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [resOrdenes, resClientes] = await Promise.all([
        axios.get(`${API_URL}/ordenes`),
        axios.get(`${API_URL}/clientes`)
      ]);
      setOrdenes(resOrdenes.data);
      setClientes(resClientes.data);
    } catch (error) {
      console.error("Error cargando datos:", error);
    }
  };

  // 2. GUARDAR
  const handleGuardar = async (e) => {
    e.preventDefault();
    const payload = {
      id_cliente: form.id_cliente,
      detalle: form.detalle,
      total_facturado: form.total,
      estado: form.estado
    };

    try {
      if (modoEdicion) {
        await axios.put(`${API_URL}/ordenes/${form.id_ot}`, payload);
      } else {
        await axios.post(`${API_URL}/ordenes`, payload);
      }
      setModalAbierto(false);
      cargarDatos();
    } catch (error) {
      alert("Error al guardar la orden");
    }
  };

  // 3. ELIMINAR
  const handleEliminar = async (id) => {
    if (!window.confirm("¿Eliminar esta orden de trabajo?")) return;
    try {
      await axios.delete(`${API_URL}/ordenes/${id}`);
      cargarDatos();
    } catch (error) {
      alert("Error al eliminar");
    }
  };

  // ABRIR MODAL
  const abrirModal = (ot = null) => {
    if (ot) {
      setModoEdicion(true);
      setForm({
        id_ot: ot.id_ot,
        id_cliente: ot.id_cliente || '', // Nota: El backend debe devolver esto o no se seleccionará solo al editar
        detalle: ot.detalle,
        total: ot.total_facturado,
        estado: ot.estado
      });
    } else {
      setModoEdicion(false);
      setForm({ id_ot: '', id_cliente: '', detalle: '', total: '', estado: 'Pendiente' });
    }
    setModalAbierto(true);
  };

  return (
    <MainLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white flex items-center gap-2">
          <Wrench className="text-orange-500" /> Órdenes de Trabajo
        </h1>
        <button onClick={() => abrirModal(null)} className="bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded flex gap-2 font-bold">
          <Plus /> Nueva Orden
        </button>
      </div>

      {/* TABLA DE ÓRDENES */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-xl">
        <table className="w-full text-left text-slate-400">
          <thead className="bg-slate-950 text-white uppercase text-xs font-bold">
            <tr>
              <th className="p-4">ID</th>
              <th className="p-4">Cliente</th>
              <th className="p-4">Servicio / Detalle</th>
              <th className="p-4">Estado</th>
              <th className="p-4 text-right">Monto</th>
              <th className="p-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {ordenes.map((ot) => (
              <tr key={ot.id_ot} className="hover:bg-slate-800/50">
                <td className="p-4 font-mono text-orange-400">#{ot.id_ot}</td>
                <td className="p-4 text-white font-medium">{ot.nombre_completo}</td>
                <td className="p-4">{ot.detalle}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    ot.estado === 'Completado' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {ot.estado}
                  </span>
                </td>
                <td className="p-4 text-right text-white font-mono font-bold">
                  ${ot.total_facturado}
                </td>
                <td className="p-4 flex justify-center gap-2">
                  <button onClick={() => abrirModal(ot)} className="text-blue-400 hover:bg-slate-700 p-2 rounded"><Edit size={18}/></button>
                  <button onClick={() => handleEliminar(ot.id_ot)} className="text-red-400 hover:bg-slate-700 p-2 rounded"><Trash2 size={18}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL FORMULARIO */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 p-6 rounded-xl w-full max-w-md border border-slate-700">
            <h2 className="text-white text-xl font-bold mb-4">{modoEdicion ? 'Editar Orden' : 'Nueva Orden de Trabajo'}</h2>
            
            <form onSubmit={handleGuardar} className="space-y-4">
              
              {/* SELECTOR DE CLIENTE */}
              <div>
                <label className="text-xs text-slate-500 uppercase font-bold">Cliente</label>
                <select 
                  className="w-full bg-slate-950 text-white p-3 rounded border border-slate-700 mt-1"
                  value={form.id_cliente}
                  onChange={e => setForm({...form, id_cliente: e.target.value})}
                  required
                  disabled={modoEdicion} // No solemos cambiar el cliente de una OT ya creada
                >
                  <option value="">-- Seleccione un Cliente --</option>
                  {clientes.map(c => (
                    <option key={c.id_cliente} value={c.id_cliente}>{c.nombre_completo}</option>
                  ))}
                </select>
              </div>

              {/* DETALLE */}
              <div>
                <label className="text-xs text-slate-500 uppercase font-bold">Detalle del Servicio</label>
                <textarea 
                  className="w-full bg-slate-950 text-white p-3 rounded border border-slate-700 mt-1"
                  placeholder="Ej: Cambio de aceite y filtros..."
                  rows="3"
                  value={form.detalle}
                  onChange={e => setForm({...form, detalle: e.target.value})}
                  required
                />
              </div>

              {/* MONTO Y ESTADO */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-500 uppercase font-bold">Monto ($)</label>
                  <input 
                    type="number" 
                    className="w-full bg-slate-950 text-white p-3 rounded border border-slate-700 mt-1"
                    placeholder="0.00"
                    value={form.total}
                    onChange={e => setForm({...form, total: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 uppercase font-bold">Estado</label>
                  <select 
                    className="w-full bg-slate-950 text-white p-3 rounded border border-slate-700 mt-1"
                    value={form.estado}
                    onChange={e => setForm({...form, estado: e.target.value})}
                  >
                    <option value="Pendiente">Pendiente</option>
                    <option value="En Progreso">En Progreso</option>
                    <option value="Completado">Completado</option>
                    <option value="Cancelado">Cancelado</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 mt-4 pt-2">
                <button type="button" onClick={() => setModalAbierto(false)} className="flex-1 bg-slate-800 text-white p-3 rounded">Cancelar</button>
                <button type="submit" className="flex-1 bg-orange-600 text-white p-3 rounded font-bold">Guardar</button>
              </div>

            </form>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default Ordenes;