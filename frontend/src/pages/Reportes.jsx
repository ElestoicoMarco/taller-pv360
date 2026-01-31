import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MainLayout from '../components/Layout/MainLayout';
import { Search, FileText, Download, Printer } from 'lucide-react';
import LoadingScreen from '../components/LoadingScreen';
import Toast from '../components/Toast';

// TU URL DE RENDER
const API_URL = 'https://taller-pv360-rejl.onrender.com/api';

const Reportes = () => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');

  // 1. CARGAR DATOS
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        // Reutilizamos la ruta de clientes porque necesitamos listar a quién hacerle el reporte
        const res = await axios.get(`${API_URL}/clientes`);
        setClientes(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.error("Error cargando datos:", error);
      } finally {
        setLoading(false);
      }
    };
    cargarDatos();
  }, []);

  // ESTADO NOTIFICACIÓN
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [downloading, setDownloading] = useState(false);

  // 2. FUNCIÓN GENERAR PDF
  const descargarFicha = async (id, nombre) => {
    // 1. Mostrar notificación "GENERANDO..."
    setToastMessage(`Generando reporte para ${nombre}... Por favor espere.`);
    setDownloading(true);
    setShowToast(true);

    // 2. Simulamos espera si queremos que el mensaje se vea un momento (opcional), 
    // o simplemente lanzamos la petición.
    // Como el backend descarga directo con window.open, no podemos saber exactamente cuando termina el download del navegador.
    // Usaremos un hack de axios para descargarlo como Blob si queremos control total, 
    // O un timeout simple para la UI si usamos window.open.

    // OPCIÓN PRO: Descargar con Axios para saber cuándo termina.
    try {
      const response = await axios.get(`${API_URL}/reportes/cliente/${id}`, {
        responseType: 'blob', // IMPORTANTE para PDFs
      });

      // Crear URL del Blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Reporte_${nombre}.pdf`); // Nombre del archivo
      document.body.appendChild(link);
      link.click();
      link.remove();

      // 3. Notificación Éxito
      setToastMessage(`¡Reporte descargado correctamente!`);
      setTimeout(() => setShowToast(false), 3000); // Cerrar a los 3s

    } catch (error) {
      console.error("Error descarga:", error);
      setToastMessage("Error al generar el reporte.");
    } finally {
      setDownloading(false);
    }
  };

  // FILTRO
  const filtrados = clientes.filter(c =>
    (c.nombre_completo || '').toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <MainLayout>
      {loading && <LoadingScreen />}

      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6 animate-in fade-in slide-in-from-top-4 duration-700">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight flex items-center gap-3 drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
            <div className="p-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.3)]">
              <Printer className="text-indigo-400 drop-shadow-[0_0_10px_rgba(99,102,241,0.8)]" size={32} />
            </div>
            Centro de Reportes
          </h1>
          <p className="text-slate-400 text-sm mt-2 font-medium flex items-center gap-2">
            <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(99,102,241,0.8)]"></span>
            Sistema de Documentación Oficial
          </p>
        </div>
      </div>

      {/* TARJETAS DE ACCESO RÁPIDO (GLASS CARDS) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {/* Card Activa: Fichas */}
        <div className="relative group cursor-pointer overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900/40 to-slate-900/40 backdrop-blur-xl border border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.15)] hover:shadow-[0_0_40px_rgba(99,102,241,0.3)] transition-all duration-300 hover:-translate-y-1">
          <div className="absolute inset-0 bg-indigo-600/10 group-hover:bg-indigo-600/20 transition-colors"></div>
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-indigo-500/30 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>

          <div className="p-6 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center mb-4 text-indigo-300 group-hover:text-white group-hover:bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.2)] transition-all">
              <FileText size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Fichas de Cliente</h3>
            <p className="text-slate-400 text-sm group-hover:text-slate-200 transition-colors">
              Genera reportes técnicos detallados, historiales de servicio y estados de cuenta.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-widest">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span> Activo
            </div>
          </div>
        </div>


      </div>

      {/* BUSCADOR (INDIGO STYLE) */}
      <div className="relative mb-8 group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="text-indigo-500 group-focus-within:text-indigo-400 transition-colors drop-shadow-[0_0_5px_rgba(99,102,241,0.5)]" size={20} />
        </div>
        <input
          className="w-full bg-slate-900/60 backdrop-blur-md border border-slate-700/50 text-white pl-12 pr-4 py-4 rounded-2xl focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500 focus:shadow-[0_0_25px_rgba(99,102,241,0.15)] outline-none transition-all placeholder:text-slate-500 text-lg"
          placeholder="Buscar cliente para generar documento..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
        />
      </div>

      {/* LISTA DE GENERACIÓN (GLASS TABLE) */}
      <div className="bg-slate-900/40 backdrop-blur-xl rounded-3xl border border-indigo-500/10 shadow-[0_0_40px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col h-[500px] relative">
        {/* Glow Effects */}
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none"></div>

        <div className="p-5 bg-indigo-950/30 border-b border-indigo-500/10 flex justify-between items-center backdrop-blur-md sticky top-0 z-20">
          <h3 className="text-indigo-200 font-bold flex items-center gap-2">
            <FileText size={18} /> Clientes Disponibles
          </h3>
          <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30">
            {filtrados.length} Resultados
          </span>
        </div>

        <div className="overflow-y-auto flex-1 relative z-10 custom-scrollbar">
          {loading && <LoadingScreen />}

          <table className="w-full text-left">
            <thead className="bg-slate-950/50 text-indigo-400/80 uppercase text-xs font-bold tracking-widest sticky top-0 backdrop-blur-md">
              <tr>
                <th className="p-5">Cliente</th>
                <th className="p-5">ID Sistema</th>
                <th className="p-5 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-indigo-500/5">
              {filtrados.map(cli => (
                <tr key={cli.id_cliente} className="group hover:bg-indigo-500/5 transition-all duration-300">
                  <td className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 text-xs font-bold group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        {cli.nombre_completo.charAt(0)}
                      </div>
                      <div>
                        <div className="text-white font-medium group-hover:text-indigo-200 transition-colors">{cli.nombre_completo}</div>
                        <div className="text-xs text-slate-500 font-mono">{cli.email || 'Sin email'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-5 font-mono text-indigo-400/70 text-sm">#{cli.id_cliente}</td>
                  <td className="p-5 text-right">
                    <button
                      onClick={() => descargarFicha(cli.id_cliente, cli.nombre_completo)}
                      className="relative overflow-hidden group/btn bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold inline-flex items-center gap-2 shadow-[0_0_15px_rgba(79,70,229,0.3)] transition-all hover:scale-105 hover:shadow-[0_0_25px_rgba(79,70,229,0.5)]"
                    >
                      <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-500"></div>
                      <Download size={16} /> <span>Generar PDF</span>
                    </button>
                  </td>
                </tr>
              ))}
              {filtrados.length === 0 && !loading && (
                <tr>
                  <td colSpan="3" className="p-12 text-center text-slate-500">
                    No se encontraron resultados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* NOTIFICACIÓN TOAST */}
      {showToast && (
        <Toast
          message={toastMessage}
          onClose={() => setShowToast(false)} // No cerramos automático si está descargando
          duration={downloading ? 999999 : 3000} // Infinito mientras descarga
        />
      )}

      {/* BLOQUEO DE PANTALLA MIENTRAS GENERA (GLASS OVERLAY) */}
      {downloading && (
        <div className="fixed inset-0 z-[70] bg-[#000000]/60 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in duration-300">
          <div className="bg-[#0f172a]/90 p-10 rounded-3xl flex flex-col items-center shadow-[0_0_50px_rgba(79,70,229,0.3)] border border-indigo-500/30 relative overflow-hidden max-w-sm w-full text-center">
            {/* Background Animation */}
            <div className="absolute inset-0 bg-indigo-500/10 animate-pulse"></div>

            <div className="w-20 h-20 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-6 relative z-10 shadow-[0_0_20px_rgba(79,70,229,0.4)]"></div>
            <h2 className="text-white font-bold text-2xl animate-pulse relative z-10 mb-2">Generando PDF</h2>
            <p className="text-indigo-300 text-sm relative z-10 font-medium">Procesando datos del cliente...</p>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default Reportes;