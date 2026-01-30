import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MainLayout from '../components/Layout/MainLayout';
import { Wrench, Plus, Trash2, Save, X, AlertCircle, Edit } from 'lucide-react';
import LoadingScreen from '../components/LoadingScreen';
import Toast from '../components/Toast';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';

// URL del Backend (Render)
const API_URL = 'https://taller-pv360-rejl.onrender.com/api';

const Ordenes = () => {
  // Estados para datos
  const [ordenes, setOrdenes] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [servicios, setServicios] = useState([]);

  // Estados de interfaz
  const [modalAbierto, setModalAbierto] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Estados nuevos
  const [modoEdicion, setModoEdicion] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [deleteModal, setDeleteModal] = useState({ show: false, id: null, nombre: '' });

  // Formulario
  const [form, setForm] = useState({
    id_ot: '',
    id_cliente: '',
    detalle: '',
    total: '',
    estado: 'Pendiente'
  });

  // 1. CARGA DE DATOS
  const cargarDatos = async () => {
    // Solo mostramos loading si es la carga inicial (ordenes vacías)
    if (ordenes.length === 0) setLoading(true);

    try {
      const [resClientes, resServicios, resOrdenes] = await Promise.all([
        axios.get(`${API_URL}/clientes`),
        axios.get(`${API_URL}/servicios`),
        axios.get(`${API_URL}/ordenes`)
      ]);

      setClientes(Array.isArray(resClientes.data) ? resClientes.data : []);
      setServicios(Array.isArray(resServicios.data) ? resServicios.data : []);
      setOrdenes(Array.isArray(resOrdenes.data) ? resOrdenes.data : []);
    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargarDatos(); }, []);

  // 2. LÓGICA DEL CATÁLOGO (AUTO-COMPLETAR)
  // 2. LÓGICA DEL CATÁLOGO (AUTO-COMPLETAR)
  const handleCatalogoChange = (e) => {
    const idSeleccionado = e.target.value;
    if (!idSeleccionado) return;

    const servicio = servicios.find(s => s.id_servicio == idSeleccionado);
    if (servicio) {
      setForm(prev => ({
        ...prev,
        detalle: servicio.nombre_servicio,
        total: servicio.precio_base
      }));
    }
  };

  // ABRIR MODAL (CREAR O EDITAR)
  const abrirModal = (orden = null) => {
    setErrorMsg('');
    if (orden) {
      setModoEdicion(true);
      // Buscamos el ID del cliente basado en el nombre (ya que la tabla muestra nombre)
      // O idealmente el objeto 'orden' ya tiene el id_cliente si el backend lo devuelve.
      // Revisando server.js: SELECT ot.id_ot, c.nombre_completo, ... 
      // El backend NO devuelve id_cliente en /api/ordenes (solo hace JOIN para nombre).
      // NECESITAMOS id_cliente para editar.
      // HACK: Buscamos el cliente por nombre en la lista de clientes cargada.
      const clienteEncontrado = clientes.find(c => c.nombre_completo === orden.nombre_completo);

      setForm({
        id_ot: orden.id_ot,
        id_cliente: clienteEncontrado ? clienteEncontrado.id_cliente : '',
        detalle: orden.detalle,
        total: orden.total_facturado,
        estado: orden.estado
      });
      //
    } else {
      setModoEdicion(false);
      setForm({ id_ot: '', id_cliente: '', detalle: '', total: '', estado: 'Pendiente' });
    }
    setModalAbierto(true);
  };

  // 3. GUARDAR ORDEN
  // 3. GUARDAR ORDEN (POST / PUT)
  const handleGuardar = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!form.id_cliente) {
      setErrorMsg("⚠️ Por favor, selecciona un cliente de la lista.");
      return;
    }

    const payload = {
      id_cliente: form.id_cliente,
      detalle: form.detalle,
      total_facturado: form.total || 0,
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
      setToastMessage(modoEdicion ? "Orden actualizada correctamente" : "Orden creada exitosamente");
      setShowToast(true);

    } catch (error) {
      console.error(error);
      setErrorMsg("Error al guardar: " + (error.response?.data?.error || error.message));
    }
  };

  // 4. ELIMINAR ORDEN
  // 4. ELIMINAR ORDEN
  const handleEliminar = (id, detalle) => {
    setDeleteModal({ show: true, id, nombre: `Orden #${id} - ${detalle}` });
  };

  const confirmDelete = async () => {
    const { id } = deleteModal;
    if (!id) return;

    try {
      await axios.delete(`${API_URL}/ordenes/${id}`);
      cargarDatos();
      setToastMessage("Orden eliminada correctamente");
      setShowToast(true);
      setDeleteModal({ show: false, id: null, nombre: '' });
    } catch (error) {
      alert("Error al eliminar la orden");
    }
  };

  return (
    <MainLayout>
      {loading && <LoadingScreen />}

      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-6 animate-in fade-in slide-in-from-top-4 duration-700">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight flex items-center gap-3 drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
            <div className="p-2 bg-orange-500/10 rounded-xl border border-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.3)]">
              <Wrench className="text-orange-500 drop-shadow-[0_0_10px_rgba(249,115,22,0.8)]" size={32} />
            </div>
            Gestión de Órdenes
          </h1>
          <p className="text-slate-400 text-sm mt-2 font-medium flex items-center gap-2">
            <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(249,115,22,0.8)]"></span>
            Trabajos en Curso: <span className="text-orange-300 font-bold">{ordenes.filter(o => o.estado !== 'Entregado').length} Activos</span>
          </p>
        </div>

        <button
          onClick={() => abrirModal(null)}
          className="group relative px-6 py-3 rounded-xl bg-gradient-to-r from-orange-600 to-red-600 text-white font-bold shadow-[0_0_20px_rgba(234,88,12,0.4)] hover:shadow-[0_0_30px_rgba(234,88,12,0.6)] hover:scale-105 transition-all duration-300 overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
          <span className="relative flex items-center gap-2">
            <Plus size={20} className="group-hover:rotate-90 transition-transform" />
            Nueva Orden
          </span>
        </button>
      </div>

      {/* SEARCH/FILTER BAR (Optional placeholder for future) */}

      {/* TABLE CONTAINER (GLASS) */}
      <div className="bg-slate-900/40 backdrop-blur-xl rounded-3xl border border-orange-500/10 shadow-[0_0_40px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col h-[650px] relative">
        {/* Glow Effects */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl -ml-16 -mt-16 pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl -mr-16 -mb-16 pointer-events-none"></div>

        <div className="overflow-auto flex-1 relative z-10 custom-scrollbar">
          <table className="w-full text-left">
            <thead className="bg-slate-950/80 backdrop-blur-md text-orange-400 sticky top-0 z-20 uppercase text-xs font-bold tracking-widest border-b border-orange-500/10 shadow-lg">
              <tr>
                <th className="p-5 w-24">ID</th>
                <th className="p-5">Cliente</th>
                <th className="p-5">Detalle / Servicio</th>
                <th className="p-5 text-center">Estado</th>
                <th className="p-5 text-right">Total</th>
                <th className="p-5 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-orange-500/5">
              {ordenes.map(ot => (
                <tr key={ot.id_ot} className="group hover:bg-orange-500/5 transition-all duration-300">
                  <td className="p-5 text-center">
                    <span className="inline-block px-3 py-1 bg-orange-950/50 border border-orange-500/30 rounded-lg text-orange-400 font-mono font-bold text-xs shadow-[0_0_10px_rgba(249,115,22,0.1)] group-hover:shadow-[0_0_15px_rgba(249,115,22,0.3)] transition-all">
                      #{ot.id_ot.toString().padStart(3, '0')}
                    </span>
                  </td>
                  <td className="p-5">
                    <div className="text-white font-bold group-hover:text-orange-200 transition-colors">
                      {ot.nombre_completo || <span className="text-red-400 italic">Sin Cliente</span>}
                    </div>
                  </td>
                  <td className="p-5">
                    <span className="text-slate-300 text-sm group-hover:text-white transition-colors">
                      {ot.detalle}
                    </span>
                  </td>
                  <td className="p-5 text-center">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border backdrop-blur-md shadow-lg ${ot.estado === 'Pagado' || ot.estado === 'Pagada'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]' :
                        ot.estado === 'En Progreso'
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/30 shadow-[0_0_10px_rgba(59,130,246,0.2)]' :
                          ot.estado === 'Entregado'
                            ? 'bg-purple-500/10 text-purple-400 border-purple-500/30 shadow-[0_0_10px_rgba(168,85,247,0.2)]' :
                            'bg-yellow-500/10 text-yellow-400 border-yellow-500/30 shadow-[0_0_10px_rgba(234,179,8,0.2)]'
                      }`}>
                      <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${ot.estado === 'En Progreso' ? 'bg-blue-400' :
                          ot.estado === 'Pagado' ? 'bg-emerald-400' :
                            ot.estado === 'Entregado' ? 'bg-purple-400' : 'bg-yellow-400'
                        }`}></span>
                      {ot.estado}
                    </span>
                  </td>
                  <td className="p-5 text-right font-mono font-bold text-lg text-slate-200 group-hover:text-green-400 transition-colors shadow-black drop-shadow-md">
                    ${Number(ot.total_facturado).toLocaleString('es-AR')}
                  </td>
                  <td className="p-5">
                    <div className="flex justify-center gap-3">
                      <button onClick={() => abrirModal(ot)} className="p-2.5 bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white rounded-xl transition-all shadow-[0_0_10px_rgba(59,130,246,0.05)] hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] border border-blue-500/20"><Edit size={18} /></button>
                      <button onClick={() => handleEliminar(ot.id_ot, ot.detalle)} className="p-2.5 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition-all shadow-[0_0_10px_rgba(239,68,68,0.05)] hover:shadow-[0_0_20px_rgba(239,68,68,0.5)] border border-red-500/20"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {ordenes.length === 0 && !loading && (
                <tr>
                  <td colSpan="6" className="p-20 text-center">
                    <div className="flex flex-col items-center gap-4 text-slate-500">
                      <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center">
                        <Wrench size={32} className="opacity-50" />
                      </div>
                      <p className="text-lg">No hay órdenes registradas.</p>
                      <button onClick={() => abrirModal(null)} className="text-orange-400 hover:text-orange-300 hover:underline">
                        Crear la primera orden
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DE NUEVA ORDEN (GLASS STYLE) */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-[#000000]/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-[#0f172a]/90 backdrop-blur-xl p-8 rounded-3xl w-full max-w-lg border border-orange-500/30 shadow-[0_0_50px_rgba(234,88,12,0.2)] relative overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>

            <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-700/50 relative z-10">
              <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                <span className="w-1 h-6 bg-orange-500 rounded-full shadow-[0_0_10px_rgba(249,115,22,0.8)]"></span>
                {modoEdicion ? 'Editar Orden de Trabajo' : 'Nueva Orden de Trabajo'}
              </h2>
              <button onClick={() => setModalAbierto(false)} className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"><X size={18} /></button>
            </div>

            {errorMsg && (
              <div className="bg-red-500/5 border border-red-500/50 text-red-200 p-4 rounded-xl mb-6 text-sm flex items-center gap-3 shadow-[0_0_15px_rgba(239,68,68,0.1)] animate-in slide-in-from-top-2">
                <AlertCircle size={20} className="text-red-500" /> {errorMsg}
              </div>
            )}

            <form onSubmit={handleGuardar} className="space-y-6 relative z-10">

              {/* 1. SELECTOR CLIENTE */}
              <div>
                <label className="text-xs font-bold text-orange-400 uppercase tracking-wider mb-2 block">Cliente *</label>
                <div className="relative">
                  <select
                    className="w-full bg-slate-950/80 text-white p-4 rounded-xl border border-slate-800 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all appearance-none"
                    value={form.id_cliente}
                    onChange={e => setForm({ ...form, id_cliente: e.target.value })}
                    required
                  >
                    <option value="">-- Seleccionar Cliente --</option>
                    {clientes.map(c => (
                      <option key={c.id_cliente} value={c.id_cliente}>
                        {c.nombre_completo}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">▼</div>
                </div>
                {clientes.length === 0 && <p className="text-xs text-red-400 mt-2">⚠️ No se cargaron clientes. Revisa tu conexión.</p>}
              </div>

              {/* 2. SELECTOR CATÁLOGO */}
              <div>
                <label className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2 block flex justify-between">
                  <span>Cargar del Catálogo</span>
                  <span className="text-[10px] bg-blue-500/10 text-blue-300 px-2 py-0.5 rounded border border-blue-500/20">Opcional</span>
                </label>
                <div className="relative">
                  <select
                    className="w-full bg-slate-800/50 text-blue-200 p-3 rounded-xl border border-slate-700/50 focus:border-blue-500 outline-none transition-all appearance-none text-sm"
                    onChange={handleCatalogoChange}
                    defaultValue=""
                  >
                    <option value="">-- Autocompletar con Servicio --</option>
                    {servicios.map(s => (
                      <option key={s.id_servicio} value={s.id_servicio}>
                        {s.nombre_servicio} - ${s.precio_base}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-blue-500/50">▼</div>
                </div>
              </div>

              {/* 3. DETALLE */}
              <div>
                <label className="text-xs font-bold text-orange-400 uppercase tracking-wider mb-2 block">Detalle del Trabajo *</label>
                <textarea
                  className="w-full bg-slate-950/80 text-white p-4 rounded-xl border border-slate-800 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all placeholder:text-slate-600 resize-none"
                  rows="3"
                  placeholder="Describe el trabajo a realizar..."
                  value={form.detalle}
                  onChange={e => setForm({ ...form, detalle: e.target.value })}
                  required
                />
              </div>

              {/* 4. TOTAL Y ESTADO */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-bold text-green-400 uppercase tracking-wider mb-2 block">Total ($)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">$</span>
                    <input
                      type="number"
                      className="w-full bg-slate-950/80 text-white pl-8 pr-4 py-4 rounded-xl border border-slate-800 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-all font-mono text-lg font-bold"
                      value={form.total}
                      onChange={e => setForm({ ...form, total: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-2 block">Estado</label>
                  <div className="relative">
                    <select
                      className="w-full bg-slate-950/80 text-white p-4 rounded-xl border border-slate-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all appearance-none"
                      value={form.estado}
                      onChange={e => setForm({ ...form, estado: e.target.value })}
                    >
                      <option value="Pendiente">Pendiente</option>
                      <option value="En Progreso">En Progreso</option>
                      <option value="Pagado">Pagado</option>
                      <option value="Entregado">Entregado</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">▼</div>
                  </div>
                </div>
              </div>

              <div className="pt-6 flex gap-4">
                <button type="button" onClick={() => setModalAbierto(false)} className="px-6 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/50 font-bold transition-colors">Cancelar</button>
                <button type="submit" className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white px-6 py-3 rounded-xl font-bold shadow-[0_0_20px_rgba(234,88,12,0.3)] flex justify-center gap-2 items-center transition-all transform hover:scale-[1.02]">
                  <Save size={20} /> Guardar Orden
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* NOTIFICACIÓN TOAST */}
      {showToast && (
        <Toast
          message={toastMessage}
          onClose={() => setShowToast(false)}
          duration={3000}
        />
      )}

      {/* MODAL ELIMINAR */}
      <DeleteConfirmationModal
        isOpen={deleteModal.show}
        onClose={() => setDeleteModal({ ...deleteModal, show: false })}
        onConfirm={confirmDelete}
        itemName={deleteModal.nombre}
      />
    </MainLayout>
  );
};

export default Ordenes;