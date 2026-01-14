import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MainLayout from '../components/Layout/MainLayout';
import { Search, User, Edit, Trash2, UserPlus, X, Save } from 'lucide-react';

// URL DE TU BACKEND EN RENDER
const API_URL = 'https://taller-pv360-c69q.onrender.com/api/clientes';

const Clientes = () => {
  // --- ESTADOS ---
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');

  // Estados del Modal (Formulario)
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [form, setForm] = useState({ id: null, nombre: '', email: '', telefono: '' });

  // --- 1. CARGAR DATOS ---
  const cargarClientes = async () => {
    try {
      const res = await axios.get(API_URL);
      setClientes(Array.isArray(res.data) ? res.data : []);
      setLoading(false);
    } catch (error) {
      console.error("Error:", error);
      setLoading(false);
    }
  };

  useEffect(() => { cargarClientes(); }, []);

  // --- 2. MANEJO DEL MODAL ---
  const abrirModal = (cliente = null) => {
    if (cliente) {
      setModoEdicion(true);
      setForm({
        id: cliente.id_cliente,
        nombre: cliente.nombre_completo,
        email: cliente.email || '',
        telefono: cliente.telefono || ''
      });
    } else {
      setModoEdicion(false);
      setForm({ id: null, nombre: '', email: '', telefono: '' });
    }
    setModalAbierto(true);
  };

  // --- 3. GUARDAR (CREAR / EDITAR) ---
  const handleGuardar = async (e) => {
    e.preventDefault();
    
    // OBJETO LISTO PARA ENVIAR (Normalizamos nombres)
    const datosEnviar = {
      nombre_completo: form.nombre,
      email: form.email,
      telefono: form.telefono
    };

    try {
      if (modoEdicion) {
        await axios.put(`${API_URL}/${form.id}`, datosEnviar);
        alert("Cliente actualizado correctamente");
      } else {
        await axios.post(API_URL, datosEnviar);
        alert("Cliente creado correctamente");
      }
      setModalAbierto(false);
      cargarClientes(); // Recargar tabla
    } catch (error) {
      console.error(error);
      alert("Error al guardar. Revisa la consola.");
    }
  };

  // --- 4. ELIMINAR ---
  const handleEliminar = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este cliente?')) return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      cargarClientes();
      alert('Cliente eliminado');
    } catch (error) {
      alert('Error al eliminar');
    }
  };

  // FILTRO DE BÚSQUEDA
  const clientesFiltrados = clientes.filter(cli =>
    (cli.nombre_completo || '').toLowerCase().includes(busqueda.toLowerCase()) ||
    (cli.email || '').toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <MainLayout>
      {/* CABECERA CON BUSCADOR Y BOTÓN NUEVO */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Base de Clientes</h1>
          <p className="text-slate-400 text-sm mt-1">
            {loading ? 'Cargando...' : `${clientesFiltrados.length} clientes registrados`}
          </p>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <div className="bg-slate-800 p-2 rounded-lg flex items-center border border-slate-700 flex-1 md:w-64">
            <Search className="text-slate-400 mr-2" size={20}/>
            <input 
              type="text" placeholder="Buscar..." 
              className="bg-transparent text-white outline-none placeholder-slate-500 w-full"
              value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
          
          <button onClick={() => abrirModal()} className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors flex items-center gap-2 px-4">
            <UserPlus size={20} /> <span className="hidden md:inline">Nuevo</span>
          </button>
        </div>
      </div>

      {/* TABLA BONITA */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-slate-400">
            <thead className="bg-slate-950 text-slate-200 uppercase text-xs font-bold">
              <tr>
                <th className="p-4">ID</th>
                <th className="p-4">Cliente</th>
                <th className="p-4">Contacto</th>
                <th className="p-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {clientesFiltrados.map((cli) => (
                <tr key={cli.id_cliente} className="hover:bg-slate-800/50 transition-colors group">
                  <td className="p-4 font-mono text-blue-400">#{cli.id_cliente}</td>
                  
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-900/30 p-2 rounded-full text-blue-400">
                        <User size={16}/>
                      </div>
                      <div>
                        <p className="text-white font-medium">{cli.nombre_completo}</p>
                      </div>
                    </div>
                  </td>
                  
                  <td className="p-4 text-sm">
                    <div className="flex flex-col">
                      <span className="text-white">{cli.email}</span>
                      <span className="text-slate-500 text-xs">{cli.telefono}</span>
                    </div>
                  </td>

                  <td className="p-4">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => abrirModal(cli)} className="p-2 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-colors" title="Editar">
                        <Edit size={18} />
                      </button>
                      <button onClick={() => handleEliminar(cli.id_cliente)} className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors" title="Eliminar">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL (FORMULARIO) */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm p-4">
          <div className="bg-slate-900 p-6 rounded-xl w-full max-w-md border border-slate-700 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">{modoEdicion ? 'Editar Cliente' : 'Nuevo Cliente'}</h2>
              <button onClick={() => setModalAbierto(false)} className="text-slate-400 hover:text-white"><X size={24}/></button>
            </div>
            
            <form onSubmit={handleGuardar} className="space-y-4">
              <div>
                <label className="text-slate-400 text-sm">Nombre Completo</label>
                <input 
                  type="text" required 
                  className="w-full bg-slate-800 border border-slate-700 rounded p-3 text-white mt-1 focus:border-blue-500 outline-none"
                  value={form.nombre}
                  onChange={(e) => setForm({...form, nombre: e.target.value})}
                />
              </div>
              <div>
                <label className="text-slate-400 text-sm">Email</label>
                <input 
                  type="email" 
                  className="w-full bg-slate-800 border border-slate-700 rounded p-3 text-white mt-1 focus:border-blue-500 outline-none"
                  value={form.email}
                  onChange={(e) => setForm({...form, email: e.target.value})}
                />
              </div>
              <div>
                <label className="text-slate-400 text-sm">Teléfono</label>
                <input 
                  type="text" 
                  className="w-full bg-slate-800 border border-slate-700 rounded p-3 text-white mt-1 focus:border-blue-500 outline-none"
                  value={form.telefono}
                  onChange={(e) => setForm({...form, telefono: e.target.value})}
                />
              </div>
              
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold flex justify-center items-center gap-2 mt-4 transition-colors">
                <Save size={20}/> {modoEdicion ? 'Actualizar' : 'Guardar'}
              </button>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default Clientes;