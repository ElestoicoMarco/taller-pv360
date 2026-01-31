import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MainLayout from '../components/Layout/MainLayout';
import { Search, Edit, Trash2, UserPlus, Save, X, FileText, Car } from 'lucide-react';
import LoadingScreen from '../components/LoadingScreen';
import Toast from '../components/Toast';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import VehiculosModal from '../components/VehiculosModal';

// URL DEL BACKEND
const API_URL = 'https://taller-pv360-rejl.onrender.com/api/clientes';

const Clientes = () => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');

  // ESTADOS MODAL
  const [modalAbierto, setModalAbierto] = useState(false);
  const [vehiculosModal, setVehiculosModal] = useState({ open: false, id: null, nombre: '' });
  const [modoEdicion, setModoEdicion] = useState(false);
  const [form, setForm] = useState({ id: '', nombre: '', email: '', telefono: '', ciudad: '' });

  // CARGAR DATOS
  const cargarClientes = async () => {
    try {
      // setLoading(true); // Comentado para evitar parpadeo si ya hay datos, descomentar si se desea full screen siempre
      const res = await axios.get(API_URL);
      setClientes(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Error al cargar clientes", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargarClientes(); }, []);

  // ELIMINAR
  // ELIMINAR - PASO 1: ABRIR MODAL
  const handleEliminar = (id, nombre) => {
    setDeleteModal({ show: true, id, nombre });
  };

  // ELIMINAR - PASO 2: EJECUTAR BORRADO
  const confirmDelete = async () => {
    const { id, nombre } = deleteModal;
    if (!id) return;

    try {
      await axios.delete(`${API_URL}/${id}`);
      cargarClientes();
      setToastMessage(`Cliente "${nombre}" eliminado correctamente`);
      setShowToast(true);
      setDeleteModal({ show: false, id: null, nombre: '' }); // CERRAR MODAL
    } catch (error) {
      alert("No se pudo eliminar el cliente. Verifique si tiene órdenes activas.");
    }
  };

  // ABRIR MODAL
  const abrirModal = (cli = null) => {
    if (cli) {
      setModoEdicion(true);
      setForm({
        id: cli.id_cliente,
        nombre: cli.nombre_completo,
        email: cli.email || '',
        telefono: cli.telefono || '',
        ciudad: cli.ciudad || ''
      });
    } else {
      setModoEdicion(false);
      setForm({ id: '', nombre: '', email: '', telefono: '', ciudad: '' });
    }
    setModalAbierto(true);
  };

  // ESTADO TOAST
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // ESTADO MODAL ELIMINAR
  const [deleteModal, setDeleteModal] = useState({ show: false, id: null, nombre: '' });

  // GUARDAR
  const handleGuardar = async (e) => {
    e.preventDefault();
    const datos = {
      nombre_completo: form.nombre,
      email: form.email,
      telefono: form.telefono,
      ciudad: form.ciudad
    };

    try {
      if (modoEdicion) {
        await axios.put(`${API_URL}/${form.id}`, datos);
      } else {
        await axios.post(API_URL, datos);
      }
      setModalAbierto(false);
      cargarClientes();
      setModalAbierto(false);
      cargarClientes();
      setToastMessage(modoEdicion ? "Cliente actualizado correctamente" : "Cliente registrado exitosamente");
      setShowToast(true); // Mostrar notificación
    } catch (error) {
      alert("Error al guardar los datos. Intente nuevamente.");
    }
  };

  // FILTRO
  const filtrados = clientes.filter(c =>
    (c.nombre_completo || '').toLowerCase().includes(busqueda.toLowerCase()) ||
    (c.email || '').toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <MainLayout>
      {loading && <LoadingScreen />}

      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-6 animate-in fade-in slide-in-from-top-4 duration-700">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight flex items-center gap-3 drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
            <UserPlus className="text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.8)]" size={36} />
            Gestión de Clientes
          </h1>
          <p className="text-slate-400 text-sm mt-2 font-medium flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,199,89,0.8)]"></span>
            Base de Datos Activa: <span className="text-cyan-300 font-bold">{clientes.length} Registros</span>
          </p>
        </div>

        <button
          onClick={() => abrirModal(null)}
          className="group relative px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] hover:scale-105 transition-all duration-300 overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
          <span className="relative flex items-center gap-2">
            <UserPlus size={20} className="group-hover:rotate-12 transition-transform" />
            Nuevo Cliente
          </span>
        </button>
      </div>

      {/* SEARCH BAR (NEON STYLE) */}
      <div className="relative mb-8 group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="text-cyan-500 group-focus-within:text-cyan-400 transition-colors drop-shadow-[0_0_5px_rgba(6,182,212,0.5)]" size={20} />
        </div>
        <input
          className="w-full bg-slate-900/60 backdrop-blur-md border border-slate-700/50 text-white pl-12 pr-4 py-4 rounded-2xl focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500 focus:shadow-[0_0_25px_rgba(6,182,212,0.15)] outline-none transition-all placeholder:text-slate-500 text-lg"
          placeholder="Buscar por Nombre, Email o Teléfono..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
        />
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/20 via-transparent to-blue-500/20 opacity-0 group-focus-within:opacity-100 pointer-events-none transition-opacity duration-500 -z-10 blur-xl"></div>
      </div>

      {/* TABLE CONTAINER (GLASS) */}
      <div className="bg-slate-900/40 backdrop-blur-xl rounded-3xl border border-cyan-500/10 shadow-[0_0_40px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col h-[650px] relative">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none"></div>

        <div className="overflow-auto flex-1 relative z-10 custom-scrollbar">
          <table className="w-full text-left">
            <thead className="bg-slate-950/80 backdrop-blur-md text-cyan-400 sticky top-0 z-20 uppercase text-xs font-bold tracking-widest border-b border-cyan-500/10 shadow-lg">
              <tr>
                <th className="p-5 w-24 text-center">ID</th>
                <th className="p-5">Cliente</th>
                <th className="p-5">Contacto</th>
                <th className="p-5 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyan-500/5">
              {filtrados.map((cli) => (
                <tr key={cli.id_cliente} className="group hover:bg-cyan-500/5 transition-all duration-300">
                  <td className="p-5 text-center">
                    <span className="inline-block px-3 py-1 bg-cyan-950/50 border border-cyan-500/30 rounded-lg text-cyan-400 font-mono font-bold text-xs shadow-[0_0_10px_rgba(6,182,212,0.1)] group-hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all">
                      #{cli.id_cliente.toString().padStart(3, '0')}
                    </span>
                  </td>
                  <td className="p-5">
                    <div className="flex items-center gap-4">
                      {/* Generar Avatar con Iniciales */}
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-900/30 group-hover:scale-110 transition-transform">
                        {cli.nombre_completo.charAt(0).toUpperCase()}
                      </div>
                      <div className="text-white font-bold text-lg group-hover:text-cyan-200 transition-colors">
                        {cli.nombre_completo}
                        {cli.ciudad && (
                          <div className="text-xs font-normal text-cyan-400/70 mt-0.5 flex items-center gap-1">
                            📍 {cli.ciudad}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-5">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-slate-300 text-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                        {cli.email || <span className="text-slate-600 italic">Sin email</span>}
                      </div>
                      <div className="flex items-center gap-2 text-slate-400 text-xs font-mono ml-3.5">
                        {cli.telefono || '---'}
                      </div>
                    </div>
                  </td>
                  <td className="p-5">
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={(e) => { e.stopPropagation(); setVehiculosModal({ open: true, id: cli.id_cliente, nombre: cli.nombre_completo }); }}
                        className="p-2 text-orange-400 hover:bg-orange-500/10 rounded-lg transition-colors tooltip"
                        title="Gestionar Flota"
                      >
                        <Car size={18} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); abrirModal(cli); }}
                        className="p-2.5 bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white rounded-xl transition-all shadow-[0_0_10px_rgba(59,130,246,0.05)] hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] border border-blue-500/20"
                        title="Editar datos"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleEliminar(cli.id_cliente, cli.nombre_completo); }}
                        className="p-2.5 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition-all shadow-[0_0_10px_rgba(239,68,68,0.05)] hover:shadow-[0_0_20px_rgba(239,68,68,0.5)] border border-red-500/20"
                        title="Eliminar registro"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtrados.length === 0 && !loading && (
                <tr>
                  <td colSpan="4" className="p-20 text-center">
                    <div className="flex flex-col items-center gap-4 text-slate-500">
                      <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center">
                        <Search size={32} className="opacity-50" />
                      </div>
                      <p className="text-lg">No se encontraron clientes con ese criterio.</p>
                      <button onClick={() => setBusqueda('')} className="text-cyan-400 hover:text-cyan-300 hover:underline">
                        Limpiar búsqueda
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL (GLASS STYLE) */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-[#000000]/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-[#0f172a]/90 backdrop-blur-xl p-8 rounded-3xl w-full max-w-md border border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.2)] relative overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>

            <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-700/50 relative z-10">
              <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                <span className="w-1 h-6 bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.8)]"></span>
                {modoEdicion ? 'Editar Cliente' : 'Nuevo Cliente'}
              </h2>
              <button
                onClick={() => setModalAbierto(false)}
                className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleGuardar} className="space-y-6 relative z-10">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2 block">Nombre Completo</label>
                  <input className="w-full bg-slate-950/80 text-white p-4 rounded-xl border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all placeholder:text-slate-600"
                    placeholder="Ej: Juan Pérez" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} required />
                </div>
                <div>
                  <label className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2 block">Ciudad / Localidad</label>
                  <select
                    className="w-full bg-slate-950/80 text-white p-4 rounded-xl border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all placeholder:text-slate-600 appearance-none"
                    value={form.ciudad}
                    onChange={e => setForm({ ...form, ciudad: e.target.value })}
                  >
                    <option value="">Seleccione una ciudad...</option>
                    <option value="San Salvador de Jujuy">San Salvador de Jujuy</option>
                    <option value="Palpalá">Palpalá</option>
                    <option value="Perico">Perico</option>
                    <option value="San Pedro">San Pedro</option>
                    <option value="Libertador Gral. San Martín">Libertador Gral. San Martín</option>
                    <option value="Tilcara">Tilcara</option>
                    <option value="Humahuaca">Humahuaca</option>
                    <option value="La Quiaca">La Quiaca</option>
                    <option value="Otra">Otra</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2 block">Correo Electrónico</label>
                  <input className="w-full bg-slate-950/80 text-white p-4 rounded-xl border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all placeholder:text-slate-600"
                    placeholder="cliente@ejemplo.com" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2 block">Teléfono</label>
                  <input className="w-full bg-slate-950/80 text-white p-4 rounded-xl border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all placeholder:text-slate-600"
                    placeholder="Ej: 388..." value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })} />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setModalAbierto(false)} className="px-6 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/50 font-bold transition-colors">Cancelar</button>
                <button type="submit" className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white px-6 py-3 rounded-xl font-bold shadow-[0_0_20px_rgba(6,182,212,0.3)] flex justify-center gap-2 items-center transition-all transform hover:scale-[1.02]">
                  <Save size={20} /> {modoEdicion ? 'Guardar Cambios' : 'Registrar'}
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
      <DeleteConfirmationModal
        isOpen={deleteModal.show}
        onClose={() => setDeleteModal({ ...deleteModal, show: false })}
        onConfirm={confirmDelete}
        itemName={deleteModal.nombre}
      />
      <VehiculosModal
        isOpen={vehiculosModal.open}
        onClose={() => setVehiculosModal({ ...vehiculosModal, open: false })}
        clienteId={vehiculosModal.id}
        clienteNombre={vehiculosModal.nombre}
      />
    </MainLayout>
  );
};

export default Clientes;