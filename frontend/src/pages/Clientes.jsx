import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MainLayout from '../components/Layout/MainLayout';
import { Search, Edit, Trash2, UserPlus, Save, X } from 'lucide-react';

// URL DE TU SERVIDOR (Asegúrate que sea la correcta de Render)
const API_URL = 'https://taller-pv360-c69q.onrender.com/api/clientes';

const Clientes = () => {
  const [clientes, setClientes] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  
  // ESTADOS DEL FORMULARIO Y MODAL
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [form, setForm] = useState({ id: '', nombre: '', email: '', telefono: '' });

  // 1. CARGAR CLIENTES (READ)
  const cargarClientes = async () => {
    try {
      const res = await axios.get(API_URL);
      // Seguridad: si la respuesta no es un array, ponemos array vacío
      setClientes(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Error cargando clientes:", error);
    }
  };

  useEffect(() => { cargarClientes(); }, []);

  // 2. ELIMINAR CLIENTE (DELETE)
  const handleEliminar = async (idRecibido) => {
    // DIAGNÓSTICO: Ver si llega el ID
    console.log("Intentando eliminar ID:", idRecibido); 
    
    if (!idRecibido) return alert("Error: No se detectó el ID del cliente");
    if (!window.confirm('¿Confirma eliminar este cliente?')) return;

    try {
      await axios.delete(`${API_URL}/${idRecibido}`);
      alert('Cliente eliminado correctamente');
      cargarClientes();
    } catch (error) {
      console.error(error);
      alert('Error al eliminar. Verifique conexión.');
    }
  };

  // 3. PREPARAR MODAL (Para Crear o Editar)
  const abrirModal = (cliente = null) => {
    if (cliente) {
      // MODO EDICIÓN: Cargamos los datos del cliente seleccionado
      setModoEdicion(true);
      setForm({
        id: cliente.id_cliente, // IMPORTANTE: Usamos id_cliente de la base de datos
        nombre: cliente.nombre_completo,
        email: cliente.email || '',
        telefono: cliente.telefono || ''
      });
    } else {
      // MODO CREAR: Limpiamos el formulario
      setModoEdicion(false);
      setForm({ id: '', nombre: '', email: '', telefono: '' });
    }
    setModalAbierto(true);
  };

  // 4. GUARDAR DATOS (CREATE / UPDATE)
  const handleGuardar = async (e) => {
    e.preventDefault(); // Evitar recarga de página
    
    // Preparamos los datos para enviar al servidor
    const datosEnviar = {
      nombre_completo: form.nombre,
      email: form.email,
      telefono: form.telefono
    };

    try {
      if (modoEdicion) {
        // ACTUALIZAR
        if (!form.id) return alert("Error: ID no encontrado para editar");
        await axios.put(`${API_URL}/${form.id}`, datosEnviar);
        alert('Cliente actualizado con éxito');
      } else {
        // CREAR
        await axios.post(API_URL, datosEnviar);
        alert('Cliente registrado con éxito');
      }
      setModalAbierto(false);
      cargarClientes();
    } catch (error) {
      console.error("Error al guardar:", error);
      alert('Error al guardar. Intente nuevamente.');
    }
  };

  // FILTRO BUSCADOR
  const clientesFiltrados = clientes.filter(cli => 
    (cli.nombre_completo || '').toLowerCase().includes(busqueda.toLowerCase()) ||
    (cli.email || '').toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <MainLayout>
      {/* CABECERA */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Clientes</h1>
        <button 
          onClick={() => abrirModal(null)} 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2 transition-colors"
        >
          <UserPlus size={20}/> Nuevo Cliente
        </button>
      </div>

      {/* BUSCADOR */}
      <div className="bg-slate-800 p-3 rounded-lg mb-6 flex items-center border border-slate-700">
         <Search className="text-slate-400 mr-2"/>
         <input 
           className="bg-transparent text-white w-full outline-none placeholder-slate-500" 
           placeholder="Buscar por nombre o email..."
           value={busqueda}
           onChange={e => setBusqueda(e.target.value)}
         />
      </div>

      {/* TABLA DE CLIENTES */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 h-[500px] overflow-y-auto shadow-lg">
        <table className="w-full text-left text-slate-400">
          <thead className="bg-slate-950 text-white sticky top-0 uppercase text-xs font-bold">
            <tr>
              <th className="p-4">ID</th>
              <th className="p-4">Nombre Completo</th>
              <th className="p-4">Contacto</th>
              <th className="p-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {clientesFiltrados.map(cli => (
              <tr key={cli.id_cliente} className="hover:bg-slate-800/50 transition-colors">
                <td className="p-4 font-mono text-blue-400">#{cli.id_cliente}</td>
                <td className="p-4 text-white font-medium">{cli.nombre_completo}</td>
                <td className="p-4 text-sm">
                  <div className="text-slate-300">{cli.email}</div>
                  <div className="text-slate-500">{cli.telefono}</div>
                </td>
                <td className="p-4">
                  <div className="flex justify-center gap-3">
                    {/* BOTÓN EDITAR */}
                    <button 
                      onClick={() => abrirModal(cli)} 
                      className="text-blue-400 hover:bg-blue-500/20 p-2 rounded transition-colors"
                      title="Editar"
                    >
                      <Edit size={18}/>
                    </button>
                    {/* BOTÓN ELIMINAR */}
                    <button 
                      onClick={() => handleEliminar(cli.id_cliente)} 
                      className="text-red-400 hover:bg-red-500/20 p-2 rounded transition-colors"
                      title="Eliminar"
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

      {/* MODAL / FORMULARIO FLOTANTE */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm p-4">
          <div className="bg-slate-900 p-6 rounded-xl w-full max-w-md border border-slate-700 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
               <h2 className="text-white text-xl font-bold">{modoEdicion ? 'Editar Cliente' : 'Nuevo Cliente'}</h2>
               <button onClick={() => setModalAbierto(false)} className="text-slate-400 hover:text-white transition-colors"><X size={24}/></button>
            </div>
            
            <form onSubmit={handleGuardar} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 uppercase font-bold">Nombre</label>
                <input 
                  className="w-full bg-slate-800 text-white p-3 rounded border border-slate-700 focus:border-blue-500 outline-none mt-1" 
                  placeholder="Ej: Juan Perez" 
                  required
                  value={form.nombre}
                  onChange={e => setForm({...form, nombre: e.target.value})}
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 uppercase font-bold">Email</label>
                <input 
                  className="w-full bg-slate-800 text-white p-3 rounded border border-slate-700 focus:border-blue-500 outline-none mt-1" 
                  placeholder="ejemplo@correo.com" 
                  type="email"
                  value={form.email}
                  onChange={e => setForm({...form, email: e.target.value})}
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 uppercase font-bold">Teléfono</label>
                <input 
                  className="w-full bg-slate-800 text-white p-3 rounded border border-slate-700 focus:border-blue-500 outline-none mt-1" 
                  placeholder="Ej: 388..." 
                  value={form.telefono}
                  onChange={e => setForm({...form, telefono: e.target.value})}
                />
              </div>
              
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg font-bold flex justify-center items-center gap-2 mt-4 transition-colors">
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
