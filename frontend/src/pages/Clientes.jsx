import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MainLayout from '../components/Layout/MainLayout';
import { Search, Edit, Trash2, UserPlus, Save, X } from 'lucide-react';

const API_URL = 'https://taller-pv360-c69q.onrender.com/api/clientes';

const Clientes = () => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  
  // ESTADOS DEL MODAL
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [form, setForm] = useState({ id: '', nombre: '', email: '', telefono: '' });

  // 1. CARGAR DATOS
  const cargarClientes = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_URL);
      console.log("Datos recibidos de DB:", res.data); // MIRA LA CONSOLA (F12)
      setClientes(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Error cargando:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargarClientes(); }, []);

  // 2. ELIMINAR (DELETE)
  const handleEliminar = async (id, nombre) => {
    console.log(`🟡 Click Eliminar detectado. ID: ${id}`); // DIAGNOSTICO

    if (!id) return alert("ERROR: El botón no tiene el ID del cliente.");
    
    if (!window.confirm(`¿Estás seguro de ELIMINAR a ${nombre}?`)) return;

    try {
      await axios.delete(`${API_URL}/${id}`);
      alert("✅ Eliminado correctamente");
      cargarClientes();
    } catch (error) {
      console.error(error);
      alert("❌ Error al eliminar. Revisa la consola.");
    }
  };

  // 3. ABRIR MODAL
  const abrirModal = (cliente = null) => {
    if (cliente) {
      console.log("📝 Editando ID:", cliente.id_cliente);
      setModoEdicion(true);
      setForm({
        id: cliente.id_cliente, // OJO AQUÍ: id_cliente
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

  // 4. GUARDAR (INSERT / UPDATE)
  const handleGuardar = async (e) => {
    e.preventDefault();
    const payload = {
      nombre_completo: form.nombre,
      email: form.email,
      telefono: form.telefono
    };

    try {
      if (modoEdicion) {
        if (!form.id) return alert("Error: No tengo ID para editar");
        await axios.put(`${API_URL}/${form.id}`, payload);
        alert("✅ Actualizado");
      } else {
        await axios.post(API_URL, payload);
        alert("✅ Creado");
      }
      setModalAbierto(false);
      cargarClientes();
    } catch (error) {
      console.error(error);
      alert("Error al guardar");
    }
  };

  const filtrados = clientes.filter(c => 
    (c.nombre_completo || '').toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Clientes</h1>
        <button onClick={() => abrirModal(null)} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded flex gap-2">
          <UserPlus size={20}/> Nuevo
        </button>
      </div>

      <div className="bg-slate-800 p-3 rounded mb-4 flex border border-slate-700">
         <Search className="text-slate-400 mr-2"/>
         <input className="bg-transparent text-white w-full outline-none" 
           placeholder="Buscar..." value={busqueda} onChange={e => setBusqueda(e.target.value)} />
      </div>

      {/* TABLA */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 h-[500px] overflow-y-auto relative z-0">
        <table className="w-full text-left text-slate-400">
          <thead className="bg-slate-950 text-white sticky top-0 uppercase text-xs z-10">
            <tr>
              <th className="p-4">ID</th>
              <th className="p-4">Cliente</th>
              <th className="p-4">Datos</th>
              <th className="p-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {filtrados.map((cli) => (
              <tr key={cli.id_cliente} className="hover:bg-slate-800 relative">
                <td className="p-4 font-mono text-blue-400">#{cli.id_cliente}</td>
                <td className="p-4 text-white font-bold">{cli.nombre_completo}</td>
                <td className="p-4 text-sm">
                  <div>{cli.email}</div>
                  <div>{cli.telefono}</div>
                </td>
                <td className="p-4 text-center">
                  <div className="flex justify-center gap-3 relative z-20"> {/* z-20 para asegurar click */}
                    
                    {/* BOTÓN EDITAR */}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation(); // IMPORTANTE: Detiene interferencias
                        abrirModal(cli);
                      }}
                      className="bg-blue-900/40 text-blue-400 hover:bg-blue-600 hover:text-white p-2 rounded border border-blue-900"
                    >
                      <Edit size={18} />
                    </button>

                    {/* BOTÓN ELIMINAR */}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation(); // IMPORTANTE: Detiene interferencias
                        handleEliminar(cli.id_cliente, cli.nombre_completo);
                      }}
                      className="bg-red-900/40 text-red-400 hover:bg-red-600 hover:text-white p-2 rounded border border-red-900"
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
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-slate-900 p-6 rounded-xl w-full max-w-md border border-slate-700 shadow-2xl">
            <div className="flex justify-between mb-4">
               <h2 className="text-white text-xl font-bold">{modoEdicion ? 'Editar' : 'Nuevo'}</h2>
               <button onClick={() => setModalAbierto(false)} className="text-slate-400 hover:text-white"><X/></button>
            </div>
            <form onSubmit={handleGuardar} className="space-y-4">
              <input className="w-full bg-slate-950 text-white p-3 rounded border border-slate-700" 
                placeholder="Nombre" required value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} />
              <input className="w-full bg-slate-950 text-white p-3 rounded border border-slate-700" 
                placeholder="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
              <input className="w-full bg-slate-950 text-white p-3 rounded border border-slate-700" 
                placeholder="Teléfono" value={form.telefono} onChange={e => setForm({...form, telefono: e.target.value})} />
              
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white p-3 rounded font-bold mt-4 flex justify-center gap-2">
                <Save size={20}/> Guardar
              </button>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default Clientes;