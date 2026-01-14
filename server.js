import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MainLayout from '../components/Layout/MainLayout';
import { Search, User, Edit, Trash2, UserPlus, X, Save } from 'lucide-react';

const API_URL = 'https://taller-pv360-c69q.onrender.com/api/clientes';

const Clientes = () => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  
  // ESTADOS PARA EL FORMULARIO (MODAL)
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [clienteActual, setClienteActual] = useState({ id: null, nombre: '', email: '', telefono: '' });

  // 1. CARGAR CLIENTES
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

  // 2. FUNCIÓN ELIMINAR
  const handleEliminar = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este cliente?')) return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      cargarClientes(); // Recargar lista
      alert('Cliente eliminado');
    } catch (error) {
      alert('Error al eliminar');
    }
  };

  // 3. ABRIR MODAL (PARA CREAR O EDITAR)
  const abrirModal = (cliente = null) => {
    if (cliente) {
      setModoEdicion(true);
      setClienteActual({ 
        id: cliente.id_cliente, 
        nombre: cliente.nombre_completo, 
        email: cliente.email, 
        telefono: cliente.telefono 
      });
    } else {
      setModoEdicion(false);
      setClienteActual({ id: null, nombre: '', email: '', telefono: '' });
    }
    setModalAbierto(true);
  };

  // 4. GUARDAR (CREAR O EDITAR)
  const handleGuardar = async (e) => {
    e.preventDefault();
    try {
      if (modoEdicion) {
        // ACTUALIZAR (PUT)
        await axios.put(`${API_URL}/${clienteActual.id}`, {
          nombre: clienteActual.nombre,
          email: clienteActual.email,
          telefono: clienteActual.telefono
        });
      } else {
        // CREAR (POST)
        await axios.post(API_URL, {
          nombre: clienteActual.nombre,
          email: clienteActual.email,
          telefono: clienteActual.telefono
        });
      }
      setModalAbierto(false);
      cargarClientes(); // Recargar tabla
    } catch (error) {
      alert('Error al guardar');
    }
  };

  // FILTRO DE BÚSQUEDA
  const clientesFiltrados = clientes.filter(cli =>
    (cli.nombre_completo || '').toLowerCase().includes(busqueda.toLowerCase()) ||
    (cli.email || '').toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <MainLayout>
      {/* CABECERA */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Clientes ({clientes.length})</h1>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="bg-slate-800 p-2 rounded-lg flex items-center border border-slate-700 flex-1">
            <Search className="text-slate-400 mr-2" size={20}/>
            <input 
              type="text" placeholder="Buscar..." 
              className="bg-transparent text-white outline-none w-full"
              value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
          <button onClick={() => abrirModal()} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
            <UserPlus size={20} /> <span className="hidden md:inline">Nuevo</span>
          </button>
        </div>
      </div>

      {/* TABLA */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-xl h-[600px] overflow-y-auto">
        <table className="w-full text-left text-slate-400">
          <thead className="bg-slate-950 text-slate-200 uppercase text-xs font-bold sticky top-0">
            <tr>
              <th className="p-4">ID</th>
              <th className="p-4">Cliente</th>
              <th className="p-4">Contacto</th>
              <th className="p-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {clientesFiltrados.map((cli) => (
              <tr key={cli.id_cliente} className="hover:bg-slate-800/50">
                <td className="p-4 text-blue-400 font-mono">#{cli.id_cliente}</td>
                <td className="p-4 font-medium text-white">{cli.nombre_completo}</td>
                <td className="p-4 text-sm">
                  <div className="flex flex-col">
                    <span>{cli.email}</span>
                    <span className="text-slate-500">{cli.telefono}</span>
                  </div>
                </td>
                <td className="p-4 flex justify-center gap-2">
                  <button onClick={() => abrirModal(cli)} className="p-2 hover:bg-blue-500/20 text-blue-400 rounded transition">
                    <Edit size={18} />
                  </button>
                  <button onClick={() => handleEliminar(cli.id_cliente)} className="p-2 hover:bg-red-500/20 text-red-400 rounded transition">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL (VENTANA FLOTANTE) */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
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
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white mt-1 focus:border-blue-500 outline-none"
                  value={clienteActual.nombre}
                  onChange={(e) => setClienteActual({...clienteActual, nombre: e.target.value})}
                />
              </div>
              <div>
                <label className="text-slate-400 text-sm">Email</label>
                <input 
                  type="email" 
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white mt-1 focus:border-blue-500 outline-none"
                  value={clienteActual.email}
                  onChange={(e) => setClienteActual({...clienteActual, email: e.target.value})}
                />
              </div>
              <div>
                <label className="text-slate-400 text-sm">Teléfono</label>
                <input 
                  type="text" 
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white mt-1 focus:border-blue-500 outline-none"
                  value={clienteActual.telefono}
                  onChange={(e) => setClienteActual({...clienteActual, telefono: e.target.value})}
                />
              </div>
              
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold flex justify-center items-center gap-2 mt-4">
                <Save size={20}/> Guardar Cambios
              </button>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default Clientes;