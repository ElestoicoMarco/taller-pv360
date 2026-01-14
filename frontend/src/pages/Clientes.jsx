import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MainLayout from '../components/Layout/MainLayout';
import { Search, UserPlus, X, Save, Edit, Trash2 } from 'lucide-react';

// URL DE RENDER
const API_URL = 'https://taller-pv360-c69q.onrender.com/api/clientes';

const Clientes = () => {
  const [clientes, setClientes] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  
  // CONTROL DEL MODAL
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [form, setForm] = useState({ id: '', nombre: '', email: '', telefono: '' });

  // CARGAR DATOS
  const cargarClientes = async () => {
    try {
      const res = await axios.get(API_URL);
      setClientes(Array.isArray(res.data) ? res.data : []);
    } catch (error) { console.error(error); }
  };

  useEffect(() => { cargarClientes(); }, []);

  // FUNCION BOTONES (NUEVO / EDITAR)
  const abrirModal = (cliente = null) => {
    if (cliente) {
      setModoEdicion(true);
      setForm({
        id: cliente.id_cliente,
        nombre: cliente.nombre_completo, // OJO: nombre_completo
        email: cliente.email || '',
        telefono: cliente.telefono || ''
      });
    } else {
      setModoEdicion(false);
      setForm({ id: '', nombre: '', email: '', telefono: '' });
    }
    setModalAbierto(true);
  };

  // FUNCION GUARDAR
  const handleGuardar = async (e) => {
    e.preventDefault();
    const payload = {
        nombre_completo: form.nombre, // ENVIAMOS SIEMPRE nombre_completo
        email: form.email,
        telefono: form.telefono
    };

    try {
      if (modoEdicion) {
        await axios.put(`${API_URL}/${form.id}`, payload);
        alert("Cliente Editado Correctamente");
      } else {
        await axios.post(API_URL, payload);
        alert("Cliente Creado Correctamente");
      }
      setModalAbierto(false);
      cargarClientes();
    } catch (error) {
      alert("Error al guardar: " + error.message);
    }
  };

  // FUNCION ELIMINAR
  const handleEliminar = async (id) => {
    if (!window.confirm('¿Eliminar cliente?')) return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      alert("Cliente Eliminado");
      cargarClientes();
    } catch (error) {
      alert("Error al eliminar");
    }
  };

  const filtrados = clientes.filter(c => (c.nombre_completo || '').toLowerCase().includes(busqueda.toLowerCase()));

  return (
    <MainLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Clientes</h1>
        <button onClick={() => abrirModal(null)} className="bg-blue-600 text-white px-4 py-2 rounded flex gap-2">
           <UserPlus/> Nuevo
        </button>
      </div>

      <input type="text" placeholder="Buscar..." className="bg-slate-800 text-white p-2 rounded w-full mb-4" 
             value={busqueda} onChange={e => setBusqueda(e.target.value)} />

      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden h-[500px] overflow-y-auto">
        <table className="w-full text-left text-slate-400">
          <thead className="bg-slate-950 text-white">
            <tr><th className="p-4">Nombre</th><th className="p-4">Email</th><th className="p-4">Acciones</th></tr>
          </thead>
          <tbody>
            {filtrados.map(cli => (
              <tr key={cli.id_cliente} className="border-b border-slate-800 hover:bg-slate-800">
                <td className="p-4 text-white">{cli.nombre_completo}</td>
                <td className="p-4">{cli.email}</td>
                <td className="p-4 flex gap-2">
                  <button onClick={() => abrirModal(cli)} className="text-blue-400"><Edit/></button>
                  <button onClick={() => handleEliminar(cli.id_cliente)} className="text-red-400"><Trash2/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalAbierto && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-slate-900 p-6 rounded w-full max-w-md border border-slate-700">
            <h2 className="text-white text-xl mb-4 font-bold">{modoEdicion ? 'Editar' : 'Nuevo'}</h2>
            <form onSubmit={handleGuardar} className="space-y-4">
              <input className="w-full bg-slate-800 text-white p-2 rounded" placeholder="Nombre" required
                     value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} />
              <input className="w-full bg-slate-800 text-white p-2 rounded" placeholder="Email"
                     value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
              <input className="w-full bg-slate-800 text-white p-2 rounded" placeholder="Teléfono"
                     value={form.telefono} onChange={e => setForm({...form, telefono: e.target.value})} />
              
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setModalAbierto(false)} className="bg-slate-700 text-white p-2 rounded flex-1">Cancelar</button>
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