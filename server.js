import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MainLayout from '../components/Layout/MainLayout';
import { Search, User, Edit, Trash2, UserPlus } from 'lucide-react';

// TU URL DE RENDER (Ya configurada correctamente)
const API_URL = 'https://taller-pv360-c69q.onrender.com/api/clientes';

const Clientes = () => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true); // Para saber si está cargando
  const [busqueda, setBusqueda] = useState(''); // Para que el buscador funcione

  // 1. CARGAR DATOS REALES
  useEffect(() => {
    cargarClientes();
  }, []);

  const cargarClientes = async () => {
    try {
      const res = await axios.get(API_URL);
      setClientes(Array.isArray(res.data) ? res.data : []); // Seguridad por si llega vacío
      setLoading(false);
    } catch (err) {
      console.error("Error cargando clientes:", err);
      setLoading(false);
    }
  };

  // 2. LÓGICA DEL BUSCADOR (Filtrado en tiempo real)
  const clientesFiltrados = clientes.filter(cli =>
    (cli.nombre_completo || '').toLowerCase().includes(busqueda.toLowerCase()) ||
    (cli.email || '').toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <MainLayout>
      {/* ENCABEZADO */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Base de Clientes</h1>
          <p className="text-slate-400 text-sm mt-1">
            {loading ? 'Cargando...' : `${clientesFiltrados.length} clientes registrados`}
          </p>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          {/* BARRA DE BÚSQUEDA ACTIVA */}
          <div className="bg-slate-800 p-2 rounded-lg flex items-center border border-slate-700 flex-1 md:w-64">
            <Search className="text-slate-400 mr-2" size={20}/>
            <input 
              type="text" 
              placeholder="Buscar nombre o email..." 
              className="bg-transparent text-white outline-none placeholder-slate-500 w-full"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)} // ¡Ahora sí filtra!
            />
          </div>
          
          {/* BOTÓN DE NUEVO (Visual por ahora) */}
          <button className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors flex items-center gap-2 px-4">
            <UserPlus size={20} />
            <span className="hidden md:inline">Nuevo</span>
          </button>
        </div>
      </div>

      {/* TABLA MEJORADA */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-slate-400">
            <thead className="bg-slate-950 text-slate-200 uppercase text-xs font-bold">
              <tr>
                <th className="p-4">ID</th>
                <th className="p-4">Cliente</th>
                <th className="p-4">Contacto</th>
                <th className="p-4">Estado</th>
                <th className="p-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr><td colSpan="5" className="p-8 text-center text-slate-500">Cargando datos desde la nube...</td></tr>
              ) : clientesFiltrados.length === 0 ? (
                <tr><td colSpan="5" className="p-8 text-center text-slate-500">No se encontraron clientes</td></tr>
              ) : (
                clientesFiltrados.map((cli) => (
                  <tr key={cli.id_cliente} className="hover:bg-slate-800/50 transition-colors group">
                    <td className="p-4 font-mono text-blue-400">#{cli.id_cliente}</td>
                    
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-900/30 p-2 rounded-full text-blue-400">
                          <User size={16}/>
                        </div>
                        <div>
                          <p className="text-white font-medium">{cli.nombre_completo}</p>
                          <p className="text-xs text-slate-500 md:hidden">{cli.email}</p>
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
                      <span className="bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded text-xs font-medium border border-emerald-500/20">
                        Activo
                      </span>
                    </td>

                    {/* NUEVOS BOTONES DE ACCIÓN */}
                    <td className="p-4">
                      <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-colors" title="Editar">
                          <Edit size={18} />
                        </button>
                        <button className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors" title="Eliminar">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </MainLayout>
  );
};

export default Clientes;