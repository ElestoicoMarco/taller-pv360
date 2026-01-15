import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MainLayout from '../components/Layout/MainLayout';
import { Search, Edit, Trash2, UserPlus, Save, X } from 'lucide-react';

const API_URL = 'https://taller-pv360-c69q.onrender.com/api/clientes';

const Clientes = () => {
  const [clientes, setClientes] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  
  // ESTADOS
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [form, setForm] = useState({ id: '', nombre: '', email: '', telefono: '' });

  // CARGAR
  const cargarClientes = async () => {
    try {
      const res = await axios.get(API_URL);
      setClientes(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Error al cargar:", error);
    }
  };

  useEffect(() => { cargarClientes(); }, []);

  // --- FUNCIÓN ELIMINAR ---
  const handleEliminar = async (idRecibido) => {
    // 1. PRUEBA DE VIDA: ¿El botón funciona?
    // alert(`CLICK DETECTADO. Intentando borrar ID: ${idRecibido}`); // Descomentar si dudas del click

    if (!idRecibido) {
        alert("ERROR GRAVE: El ID es 'undefined'. Revisa la consola.");
        console.error("ID es undefined. Objeto fila:", idRecibido);
        return;
    }

    if (!window.confirm(`¿Seguro que deseas eliminar al cliente #${idRecibido}?`)) return;

    try {
      await axios.delete(`${API_URL}/${idRecibido}`);
      alert('✅ Eliminado correctamente');
      cargarClientes(); // Recargar tabla
    } catch (error) {
      console.error("Error delete:", error);
      alert('❌ Error al eliminar. Puede que el servidor no responda.');
    }
  };

  // --- ABRIR MODAL ---
  const abrirModal = (cliente = null) => {
    if (cliente) {
      setModoEdicion(true);
      // Mapeamos explícitamente id_cliente a form.id
      setForm({
        id: cliente.id_cliente, 
        nombre: cliente.nombre_completo,
        email: cliente.email || '',
        telefono: cliente.telefono || ''
      });
    } else {
      setModoEdicion(false);
      setForm({ id: '', nombre: '', email: '', telefono: '' });
    }
    setModalAbierto(true);
  };

  // --- GUARDAR ---
  const handleGuardar = async (e) => {
    e.preventDefault();
    const payload = {
      nombre_completo: form.nombre,
      email: form.email,
      telefono: form.telefono
    };

    try {
      if (modoEdicion) {
        // Validación extra
        if(!form.id) return alert("Error: No hay ID para editar.");
        
        await axios.put(`${API_URL}/${form.id}`, payload);
        alert('✅ Actualizado con éxito');
      } else {
        await axios.post(API_URL, payload);
        alert('✅ Creado con éxito');
      }
      setModalAbierto(false);
      cargarClientes();
    } catch (error) {
      console.error(error);
      alert('❌ Error al guardar datos.');
    }
  };

  // FILTRO
  const filtrados = clientes.filter(c => 
    (c.nombre_completo || '').toLowerCase().includes(busqueda.toLowerCase()) ||
    (c.email || '').toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Clientes</h1>
        <button 
          onClick={() => abrirModal(null)} 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2"
        >
          <UserPlus size={20}/> Nuevo
        </button>
      </div>

      <div className="bg-slate-800 p-3 rounded mb-4 flex items-center border border-slate-700">
         <Search className="text-slate-400 mr-2"/>
         <input 
           className="bg-transparent text-white w-full outline-none" 
           placeholder="Buscar..."
           value={busqueda} onChange={e => setBusqueda(e.target.value)}
         />
      </div>

      <div className="bg-slate-900 rounded-xl border border-slate-800 h-[500px] overflow-y-auto shadow-lg">
        <table className="w-full text-left text-slate-400">
          <thead className="bg-slate-950 text-white sticky top-0 uppercase text-xs">
            <tr>
              <th className="p-4">ID</th>
              <th className="p-4">Nombre</th>
              <th className="p-4">Datos</th>
              <th className="p-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {filtrados.map(cli => (
              <tr key={cli.id_cliente} className="hover:bg-slate-800/50">
                <td className="p-4 font-mono text-blue-400">#{cli.id_cliente}</td>
                <td className="p-4 text-white font-medium">{cli.nombre_completo}</td>
                <td className="p-4 text-sm">
                  <div>{cli.email}</div>
                  <div>{cli.telefono}</div>
                </td>
                <td className="p-4">
                  <div className="flex justify-center gap-3">
                    {/* BOTONES DIRECTOS SIN ICONOS RAROS PARA PROBAR */}
                    <button 
                      onClick={() => abrirModal(cli)} 
                      className="bg-blue-900/50 hover:bg-blue-800 text-blue-300 p-2 rounded"
                    >
                      <Edit size={18} />
                    </button>
                    
                    <button 
                      onClick={() => {
                        console.log("Click en borrar para ID:", cli.id_cliente); 
                        handleEliminar(cli.id_cliente);
                      }} 
                      className="bg-red-900/50 hover:bg-red-800 text-red-300 p-2 rounded"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 p-6 rounded-lg w-full max-w-md border border-slate-700">
            <div className="flex justify-between mb-4">
               <h2 className="text-white text-xl font-bold">{modoEdicion ? 'Editar Cliente' : 'Nuevo Cliente'}</h2>
               <button onClick={() => setModalAbierto(false)} className="text-slate-400 hover:text-white"><X/></button>
            </div>
            
            <form onSubmit={handleGuardar} className="space-y-4">
              <div>
                <label className="text-xs text-slate-500 uppercase font-bold">Nombre</label>
                <input className="w-full bg-slate-800 text-white p-3 rounded border border-slate-700 mt-1" 
                  value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} required />
              </div>
              <div>
                <label className="text-xs text-slate-500 uppercase font-bold">Email</label>
                <input className="w-full bg-slate-800 text-white p-3 rounded border border-slate-700 mt-1" 
                  value={form.email} onChange={e => setForm({...form, email: e.target.value})} type="email" />
              </div>
              <div>
                <label className="text-xs text-slate-500 uppercase font-bold">Teléfono</label>
                <input className="w-full bg-slate-800 text-white p-3 rounded border border-slate-700 mt-1" 
                  value={form.telefono} onChange={e => setForm({...form, telefono: e.target.value})} />
              </div>
              
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded font-bold mt-4 flex justify-center gap-2">
                <Save size={20}/> {modoEdicion ? 'Guardar Cambios' : 'Registrar'}
              </button>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default Clientes;