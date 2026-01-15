import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MainLayout from '../components/Layout/MainLayout';
import { Search, User, Edit, Trash2, UserPlus, X, Save } from 'lucide-react';

// URL EXACTA
const API_URL = 'https://taller-pv360-c69q.onrender.com/api/clientes';

const Clientes = () => {
  const [clientes, setClientes] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  
  // ESTADOS MODAL
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [form, setForm] = useState({ id: '', nombre: '', email: '', telefono: '' });

  // CARGAR DATOS
  const cargarClientes = async () => {
    try {
      const res = await axios.get(API_URL);
      console.log("✅ VERSION FINAL ACTIVA - Datos:", res.data); // BUSCA ESTO EN LA CONSOLA
      setClientes(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Error carga:", error);
    }
  };

  useEffect(() => { cargarClientes(); }, []);

  // ELIMINAR
  const handleEliminar = async (id, nombre) => {
    console.log("🔥 CLICK ELIMINAR EN ID:", id); // SI NO SALE ESTO, ES LA VERSION VIEJA
    
    if (!id) return alert("Error: ID no detectado");
    
    if (!window.confirm(`¿BORRAR DEFINITIVAMENTE A: ${nombre}?`)) return;

    try {
      await axios.delete(`${API_URL}/${id}`);
      alert("🗑️ Eliminado correctamente");
      cargarClientes();
    } catch (error) {
      alert("Error al eliminar");
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
        alert("✅ Editado con éxito");
      } else {
        await axios.post(API_URL, datos);
        alert("✅ Creado con éxito");
      }
      setModalAbierto(false);
      cargarClientes();
    } catch (error) {
      alert("Error al guardar");
    }
  };

  // FILTRO
  const filtrados = clientes.filter(c => 
    (c.nombre_completo || '').toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">
          CLIENTES <span className="text-sm text-green-400">(VERSIÓN FINAL)</span>
        </h1>
        <button onClick={() => abrirModal(null)} className="bg-blue-600 text-white px-4 py-2 rounded flex gap-2">
          <UserPlus/> Nuevo
        </button>
      </div>

      <div className="bg-slate-800 p-2 rounded mb-4 flex border border-slate-700">
         <Search className="text-slate-400 mr-2"/>
         <input className="bg-transparent text-white w-full outline-none" 
           placeholder="Buscar..." value={busqueda} onChange={e => setBusqueda(e.target.value)}/>
      </div>

      <div className="bg-slate-900 rounded-xl border border-slate-800 h-[500px] overflow-y-auto">
        <table className="w-full text-left text-slate-400">
          <thead className="bg-slate-950 text-white sticky top-0 uppercase text-xs">
            <tr>
              <th className="p-4">ID</th>
              <th className="p-4">Nombre</th>
              <th className="p-4">Datos</th>
              <th className="p-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map((cli) => (
              <tr key={cli.id_cliente} className="hover:bg-slate-800">
                <td className="p-4">#{cli.id_cliente}</td>
                <td className="p-4 text-white font-bold">{cli.nombre_completo}</td>
                <td className="p-4 text-sm">
                    <div>{cli.email}</div>
                    <div>{cli.telefono}</div>
                </td>
                <td className="p-4 text-center">
                  <div className="flex justify-center gap-4">
                    
                    {/* BOTÓN EDITAR - CON ONCLICK EXPLICITO */}
                    <button 
                      onClick={(e) => { e.stopPropagation(); abrirModal(cli); }}
                      className="bg-blue-900 text-blue-300 p-2 rounded hover:bg-blue-700"
                    >
                      <Edit size={18}/>
                    </button>

                    {/* BOTÓN ELIMINAR - CON ONCLICK EXPLICITO */}
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleEliminar(cli.id_cliente, cli.nombre_completo); }}
                      className="bg-red-900 text-red-300 p-2 rounded hover:bg-red-700"
                    >
                      <Trash2 size={18}/>
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
            <h2 className="text-white text-xl font-bold mb-4">{modoEdicion ? 'Editar' : 'Nuevo'}</h2>
            <form onSubmit={handleGuardar} className="space-y-3">
              <input className="w-full bg-slate-950 text-white p-2 rounded border border-slate-700" placeholder="Nombre" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} required/>
              <input className="w-full bg-slate-950 text-white p-2 rounded border border-slate-700" placeholder="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}/>
              <input className="w-full bg-slate-950 text-white p-2 rounded border border-slate-700" placeholder="Teléfono" value={form.telefono} onChange={e => setForm({...form, telefono: e.target.value})}/>
              <div className="flex gap-2 mt-4">
                  <button type="button" onClick={() => setModalAbierto(false)} className="bg-gray-600 text-white p-2 rounded flex-1">Cancelar</button>
                  <button type="submit" className="bg-blue-600 text-white p-2 rounded flex-1">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default Clientes;