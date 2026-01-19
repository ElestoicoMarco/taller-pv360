import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MainLayout from '../components/Layout/MainLayout';
import { Search, FileText, Download, Printer, AlertCircle } from 'lucide-react';
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
      {/* CABECERA */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Printer className="text-blue-500" size={32} />
          Centro de Reportes
        </h1>
        <p className="text-slate-400 mt-2">
          Genera y descarga documentación oficial, fichas técnicas y reportes de estado.
        </p>
      </div>

      {/* TARJETA DE ACCESO RÁPIDO (PRÓXIMAMENTE) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 border-l-4 border-l-blue-500">
          <h3 className="text-white font-bold flex items-center gap-2"><FileText size={18} /> Fichas de Cliente</h3>
          <p className="text-xs text-slate-400 mt-1">Descarga el historial y datos técnicos.</p>
        </div>
        <div className="bg-slate-800/30 p-4 rounded-xl border border-slate-700 opacity-50 cursor-not-allowed">
          <h3 className="text-slate-400 font-bold flex items-center gap-2"><AlertCircle size={18} /> Órdenes de Trabajo</h3>
          <p className="text-xs text-slate-500 mt-1">Próximamente disponible.</p>
        </div>
      </div>

      {/* BUSCADOR */}
      <div className="bg-slate-800 p-3 rounded-lg mb-6 flex items-center border border-slate-700">
        <Search className="text-slate-400 mr-2" />
        <input
          className="bg-transparent text-white w-full outline-none"
          placeholder="Buscar cliente para generar reporte..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
        />
      </div>

      {/* LISTA DE GENERACIÓN */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="p-4 bg-slate-950 border-b border-slate-800">
          <h3 className="text-white font-bold">Clientes Disponibles ({filtrados.length})</h3>
        </div>

        <div className="max-h-[500px] overflow-y-auto">
          {loading ? (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-900/50"><LoadingScreen /></div>
          ) : (
            <table className="w-full text-left text-slate-400">
              <thead className="bg-slate-900 text-xs uppercase font-bold sticky top-0">
                <tr>
                  <th className="p-4">Cliente</th>
                  <th className="p-4">ID Sistema</th>
                  <th className="p-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filtrados.map(cli => (
                  <tr key={cli.id_cliente} className="hover:bg-slate-800/50 transition-colors">
                    <td className="p-4">
                      <div className="text-white font-medium">{cli.nombre_completo}</div>
                      <div className="text-xs text-slate-500">{cli.email || 'Sin email'}</div>
                    </td>
                    <td className="p-4 font-mono text-blue-400">#{cli.id_cliente}</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => descargarFicha(cli.id_cliente, cli.nombre_completo)}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-bold inline-flex items-center gap-2 shadow-lg shadow-blue-900/20 transition-all hover:scale-105"
                      >
                        <Download size={16} /> Generar PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
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

      {/* BLOQUEO DE PANTALLA MIENTRAS GENERA (Opcional, si el usuario pidió "Que no deje de cargar") */}
      {downloading && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in">
          <div className="bg-slate-900 p-8 rounded-2xl flex flex-col items-center shadow-2xl border border-blue-500/30">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <h2 className="text-white font-bold text-xl animate-pulse">Generando Documento...</h2>
            <p className="text-blue-400 text-sm mt-2">Preparando PDF para descarga</p>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default Reportes;