import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MainLayout from '../components/Layout/MainLayout';
import { Search, Edit, Trash2, UserPlus, Save, X } from 'lucide-react';

// --- CONFIGURACIÓN EXPERTA ---
// Asegura que la URL no tenga barra al final para evitar doble barra //
const API_URL = 'https://taller-pv360-c69q.onrender.com/api/clientes';

const Clientes = () => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  
  // ESTADOS DEL MODAL
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  
  // FORMULARIO: Inicializamos todo vacío para evitar 'uncontrolled components'
  const [form, setForm] = useState({ id: '', nombre: '', email: '', telefono: '' });

  // 1. CARGAR DATOS (READ)
  const cargarClientes = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_URL);
      console.log("📡 Datos recibidos:", res.data); // LOG PARA DEPURAR
      setClientes(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("❌ Error de conexión:", error);
      alert("Error: No se pudo conectar al servidor.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargarClientes(); }, []);

  // 2. ELIMINAR (DELETE)
  const handleEliminar = async (id, nombre) => {
    // DIAGNÓSTICO VISUAL
    console.log(`🗑️ INTENTO ELIMINAR ID: ${id}`);
    
    if (!id) return alert("ERROR CRÍTICO: El botón no capturó el ID. Revisa la consola.");

    const confirmacion = window.confirm(`ATENCIÓN:\n¿Estás seguro de eliminar a "${nombre}"?\nEsta acción es irreversible.`);
    
    if (!confirmacion) return;

    try {
      await axios.delete(`${API_URL}/${id}`);
      alert("✅ Cliente eliminado correctamente.");
      cargarClientes(); // Recargar la lista
    } catch (error) {
      console.error("❌ Error al eliminar:", error);
      alert("Error al eliminar. Verifique que el servidor esté activo.");
    }
  };

  // 3. ABRIR MODAL
  const abrirModal = (cliente = null) => {
    if (cliente) {
      // MODO EDICIÓN
      console.log("📝 Editando cliente:", cliente);
      setModoEdicion(true);
      setForm({
        id: cliente.id_cliente, // MAPEO CRÍTICO: id_cliente de la DB
        nombre: cliente.nombre_completo,
        email: cliente.email || '',
        telefono: cliente.telefono || ''
      });
    } else {
      // MODO CREAR
      setModoEdicion(false);
      setForm({ id: '', nombre: '', email: '', telefono: '' });
    }
    setModalAbierto(true);
  };

  // 4. GUARDAR (CREATE / UPDATE)
  const handleGuardar = async (e) => {
    e.preventDefault();
    
    const payload = {
      nombre_completo: form.nombre,
      email: form.email,
      telefono: form.telefono
    };

    console.log("💾 Enviando datos:", payload);

    try {
      if (modoEdicion) {
        if (!form.id) return alert("Error: No hay ID para editar.");
        await axios.put(`${API_URL}/${form.id}`, payload);
        alert("✅ Cliente actualizado.");
      } else {
        await axios.post(API_URL, payload);
        alert("✅ Cliente registrado.");
      }
      setModalAbierto(false);
      cargarClientes();
    } catch (error) {
      console.error("Error guardando:", error);
      alert("Error al guardar. Revise la consola.");
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">
          Clientes <span className="text-sm text-slate-500">({clientes.length})</span>
        </h1>
        <button 
          onClick={() => abrirModal(null)} 
          className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg shadow-blue-900/50 active:scale-95 transition-transform"
        >
          <UserPlus size={20}/> NUEVO
        </button>
      </div>

      {/* BUSCADOR */}
      <div className="bg-slate-800 p-3 rounded-lg mb-6 flex items-center border border-slate-700 shadow-md">
         <Search className="text-slate-400 mr-3"/>
         <input 
           className="bg-transparent text-white w-full outline-none placeholder-slate-500" 
           placeholder="Buscar cliente..."
           value={busqueda}
           onChange={e => setBusqueda(e.target.value)}
         />
      </div>

      {/* TABLA PRINCIPAL */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 h-[500px] overflow-y-auto shadow-2xl relative">
        {loading && <div className="p-4 text-center text-blue-400">Cargando base de datos...</div>}
        
        {!loading && (
          <table className="w-full text-left text-slate-400">
            <thead className="bg-slate-950 text-slate-200 sticky top-0 uppercase text-xs font-bold tracking-wider z-10 shadow-md">
              <tr>
                <th className="p-4 bg-slate-950">ID</th>
                <th className="p-4 bg-slate-950">Cliente</th>
                <th className="p-4 bg-slate-950">Contacto</th>
                <th className="p-4 bg-slate-950 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtrados.map((cli) => (
                <tr key={cli.id_cliente} className="hover:bg-slate-800/80 transition-colors duration-150">
                  <td className="p-4 font-mono text-blue-400 font-bold">#{cli.id_cliente}</td>
                  <td className="p-4">
                    <div className="text-white font-semibold text-lg">{cli.nombre_completo}</div>
                  </td>
                  <td className="p-4 text-sm">
                    <div className="text-slate-300 mb-1">{cli.email}</div>
                    <div className="text-slate-500 font-mono">{cli.telefono}</div>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex justify-center gap-4 relative z-0">
                      
                      {/* BOTÓN EDITAR ROBUSTO */}
                      <button 
                        onClick={(e) => {
                          e.stopPropagation(); // Evita clics fantasmas
                          abrirModal(cli);
                        }}
                        className="bg-blue-900/30 hover:bg-blue-600 text-blue-400 hover:text-white p-2 rounded-md transition-all border border-blue-900/50"
                        title="Editar Registro"
                      >
                        <Edit size={18} />
                      </button>

                      {/* BOTÓN ELIMINAR ROBUSTO */}
                      <button 
                        onClick={(e) => {
                          e.stopPropagation(); // Evita clics fantasmas
                          handleEliminar(cli.id_cliente, cli.nombre_completo);
                        }}
                        className="bg-red-900/30 hover:bg-red-600 text-red-400 hover:text-white p-2 rounded-md transition-all border border-red-900/50"
                        title="Eliminar Registro"
                      >
                        <Trash2 size={18} />
                      </button>

                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL / FORMULARIO */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-slate-900 p-6 rounded-xl w-full max-w-md border border-slate-700 shadow-2xl transform transition-all scale-100">
            <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <h2 className="text-white text-xl font-bold tracking-tight">
                 {modoEdicion ? 'Editar Cliente' : 'Nuevo Cliente'}
               </h2>
               <button onClick={() => setModalAbierto(false)} className="text-slate-400 hover:text-white hover:bg-slate-800 p-1 rounded-full transition-colors">
                 <X size={24}/>
               </button>
            </div>
            
            <form onSubmit={handleGuardar} className="space-y-5">
              <div>
                <label className="block text-xs text-blue-400 uppercase font-bold mb-1 ml-1">Nombre Completo</label>
                <input 
                  className="w-full bg-slate-950 text-white p-3 rounded-lg border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all" 
                  placeholder="Ej: Juan Pérez" 
                  required
                  value={form.nombre}
                  onChange={e => setForm({...form, nombre: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs text-blue-400 uppercase font-bold mb-1 ml-1">Correo Electrónico</label>
                <input 
                  className="w-full bg-slate-950 text-white p-3 rounded-lg border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all" 
                  placeholder="cliente@email.com" 
                  type="email"
                  value={form.email}
                  onChange={e => setForm({...form, email: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs text-blue-400 uppercase font-bold mb-1 ml-1">Teléfono / Celular</label>
                <input 
                  className="w-full bg-slate-950 text-white p-3 rounded-lg border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all" 
                  placeholder="388..." 
                  value={form.telefono}
                  onChange={e => setForm({...form, telefono: e.target.value})}
                />
              </div>
              
              <button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-lg font-bold mt-2 flex justify-center items-center gap-2 shadow-lg shadow-blue-900/40 transition-all hover:scale-[1.02]"
              >
                <Save size={20}/> {modoEdicion ? 'Guardar Cambios' : 'Registrar Cliente'}
              </button>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default Clientes;