import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MainLayout from '../components/Layout/MainLayout';
import { Search, Edit, Trash2, UserPlus, Save, X, FileText } from 'lucide-react';

// URL DEL BACKEND
const API_URL = 'https://taller-pv360-c69q.onrender.com/api/clientes';

const Clientes = () => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  
  // ESTADOS MODAL
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [form, setForm] = useState({ id: '', nombre: '', email: '', telefono: '' });

  // CARGAR DATOS
  const cargarClientes = async () => {
    try {
      setLoading(true);
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
  const handleEliminar = async (id, nombre) => {
    if (!window.confirm(`¿Estás seguro de eliminar al cliente "${nombre}"? Esta acción no se puede deshacer.`)) return;

    try {
      await axios.delete(`${API_URL}/${id}`);
      cargarClientes(); // Recarga silenciosa
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
        telefono: cli.telefono || ''
      });
    } else {
      setModoEdicion(false);
      setForm({ id: '', nombre: '', email: '', telefono: '' });
    }
    setModalAbierto(true);
  };

  // GUARDAR
  const handleGuardar = async (e) => {
    e.preventDefault();
    const datos = {
        nombre_completo: form.nombre,
        email: form.email,
        telefono: form.telefono
    };

    try {
      if (modoEdicion) {
        await axios.put(`${API_URL}/${form.id}`, datos);
      } else {
        await axios.post(API_URL, datos);
      }
      setModalAbierto(false);
      cargarClientes();
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
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Gestión de Clientes</h1>
          <p className="text-slate-400 text-sm mt-1">{clientes.length} clientes registrados en base de datos</p>
        </div>
        <button 
          onClick={() => abrirModal(null)} 
          className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-lg shadow-lg shadow-blue-900/20 flex items-center gap-2 transition-all active:scale-95 font-medium"
        >
          <UserPlus size={18}/> Nuevo Cliente
        </button>
      </div>

      {/* BUSCADOR */}
      <div className="bg-slate-800/50 p-1 rounded-xl mb-6 flex items-center border border-slate-700/50 backdrop-blur-sm">
         <div className="p-3 text-slate-400"><Search size={20}/></div>
         <input 
           className="bg-transparent text-white w-full outline-none placeholder-slate-500 font-medium" 
           placeholder="Buscar por nombre, correo o teléfono..." 
           value={busqueda} 
           onChange={e => setBusqueda(e.target.value)}
         />
      </div>

      {/* TABLA PRO */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col h-[600px]">
        <div className="overflow-auto flex-1">
          <table className="w-full text-left text-slate-400">
            <thead className="bg-slate-950 text-slate-200 sticky top-0 uppercase text-xs font-bold tracking-wider z-10">
              <tr>
                <th className="p-4 border-b border-slate-800">ID</th>
                <th className="p-4 border-b border-slate-800">Cliente</th>
                <th className="p-4 border-b border-slate-800">Contacto</th>
                <th className="p-4 border-b border-slate-800 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filtrados.map((cli) => (
                <tr key={cli.id_cliente} className="hover:bg-slate-800/40 transition-colors group">
                  <td className="p-4 font-mono text-blue-400 font-medium text-sm">#{cli.id_cliente}</td>
                  <td className="p-4">
                    <div className="text-white font-semibold">{cli.nombre_completo}</div>
                  </td>
                  <td className="p-4 text-sm">
                    <div className="flex flex-col gap-1">
                      <span className="text-slate-300">{cli.email}</span>
                      <span className="text-slate-500 font-mono text-xs">{cli.telefono}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center gap-2">
                      <button 
                        onClick={(e) => { e.stopPropagation(); abrirModal(cli); }}
                        className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors tooltip"
                        title="Editar datos"
                      >
                        <Edit size={18}/>
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleEliminar(cli.id_cliente, cli.nombre_completo); }}
                        className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Eliminar registro"
                      >
                        <Trash2 size={18}/>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtrados.length === 0 && !loading && (
                <tr>
                  <td colSpan="4" className="p-10 text-center text-slate-500">
                    No se encontraron clientes con ese criterio.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 p-6 rounded-2xl w-full max-w-md border border-slate-700 shadow-2xl">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-800">
               <h2 className="text-white text-xl font-bold">{modoEdicion ? 'Editar Cliente' : 'Registrar Nuevo Cliente'}</h2>
               <button onClick={() => setModalAbierto(false)} className="text-slate-400 hover:text-white transition-colors"><X size={24}/></button>
            </div>
            
            <form onSubmit={handleGuardar} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1 block">Nombre Completo</label>
                <input className="w-full bg-slate-950 text-white p-3 rounded-lg border border-slate-800 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all" 
                  placeholder="Ej: Juan Pérez" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} required/>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1 block">Correo Electrónico</label>
                <input className="w-full bg-slate-950 text-white p-3 rounded-lg border border-slate-800 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all" 
                  placeholder="cliente@ejemplo.com" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}/>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1 block">Teléfono</label>
                <input className="w-full bg-slate-950 text-white p-3 rounded-lg border border-slate-800 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all" 
                  placeholder="Ej: 388..." value={form.telefono} onChange={e => setForm({...form, telefono: e.target.value})}/>
              </div>
              
              <div className="flex gap-3 mt-6 pt-2">
                  <button type="button" onClick={() => setModalAbierto(false)} className="px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 font-medium transition-colors">Cancelar</button>
                  <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-500 text-white px-4 py-3 rounded-lg font-bold shadow-lg shadow-blue-900/20 flex justify-center gap-2 items-center transition-all">
                    <Save size={18}/> {modoEdicion ? 'Guardar Cambios' : 'Registrar'}
                  </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default Clientes;