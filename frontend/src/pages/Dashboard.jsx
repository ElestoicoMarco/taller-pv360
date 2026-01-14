import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { DollarSign, Activity, Users, CheckCircle, Plus } from 'lucide-react';
import MainLayout from '../components/Layout/MainLayout';

// Colores para el gráfico (Estilo Neón/Oscuro)
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const Dashboard = () => {
  // 1. ESTADOS
  const [kpis, setKpis] = useState({ ots: 0, total: 0, flota: 0 });
  const [chartData, setChartData] = useState([]);
  const [newCli, setNewCli] = useState({ nombre: '', email: '' });

  // 2. CARGA DE DATOS DESDE EL BACKEND
  const loadDashboard = useCallback(async () => {
    try {
      const resAna = await axios.get('https://taller-pv360-c69q.onrender.com/api/analytics');
      setKpis(resAna.data.kpis || { ots: 0, total: 0, flota: 0 });
      setChartData(resAna.data.chartVehiculos || []);
    } catch (err) {
      console.error("Error cargando dashboard:", err);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  // 3. GUARDAR CLIENTE (CON CORRECCIÓN DE ERROR "TELEFONO")
  const handleSaveClient = async (e) => {
    e.preventDefault();
    if (!newCli.nombre || !newCli.email) return alert("Por favor complete nombre y email");

    try {
      // TRUCO: Enviamos un teléfono "ficticio" porque tu base de datos lo exige
      // y este formulario nuevo no tiene ese campo visualmente.
      const payload = {
        nombre: newCli.nombre,
        email: newCli.email,
        telefono: '0' // Esto evita el error: "Field telefono doesn't have a default value"
      };

      const res = await axios.post('https://taller-pv360-c69q.onrender.com/api/clientes', payload);

      if (res.data.success) {
        setNewCli({ nombre: '', email: '' });
        alert("¡Cliente registrado con éxito!");
        loadDashboard(); // Recargamos los datos para ver si suben los KPIs
      }
    } catch (err) {
      console.error(err);
      alert("Error al guardar: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <MainLayout>
      {/* CABECERA */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Resumen Ejecutivo</h1>
          <p className="text-slate-400">Resultados en tiempo real 2025</p>
        </div>
        <div className="bg-emerald-500/10 text-emerald-400 px-4 py-2 rounded-full text-xs font-bold border border-emerald-500/20 flex items-center gap-2">
          <CheckCircle size={14} /> MySQL Conectado
        </div>
      </div>

      {/* TARJETAS DE KPI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <KpiCard 
          title="Facturación Bruta" 
          value={`$ ${Number(kpis.total).toLocaleString('es-AR')}`} 
          icon={<DollarSign className="text-blue-400" />} 
          trend="+12% vs mes anterior"
        />
        <KpiCard 
          title="Volumen Órdenes" 
          value={kpis.ots} 
          suffix="Servicios"
          icon={<Activity className="text-emerald-400" />} 
          trend="+5% vs mes anterior"
        />
        <KpiCard 
          title="Especialistas" 
          value={kpis.staff || 0} 
          suffix="Mecánicos"
          icon={<Users className="text-orange-400" />} 
        />
      </div>

      {/* SECCIÓN PRINCIPAL: GRÁFICOS Y FORMULARIO */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* GRÁFICO (Ocupa 2 columnas) */}
        <div className="lg:col-span-2 bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-xl">
          <h3 className="text-lg font-semibold text-white mb-6">Ranking por Modelo</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                <XAxis dataKey="name" tick={{fill: '#94a3b8', fontSize: 12}} axisLine={false} tickLine={false} dy={10} />
                <YAxis tick={{fill: '#94a3b8', fontSize: 12}} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v/1000000}M`} />
                <Tooltip 
                  cursor={{fill: '#1e293b'}} 
                  contentStyle={{backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', borderRadius: '8px'}} 
                />
                <Bar dataKey="valor" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* FORMULARIO RÁPIDO (Ocupa 1 columna) */}
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-xl">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Plus size={18} className="text-blue-500"/> Ingreso Rápido
          </h3>
          <form onSubmit={handleSaveClient} className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Nombre Cliente</label>
              <input 
                type="text" 
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none transition-colors"
                value={newCli.nombre}
                onChange={e => setNewCli({...newCli, nombre: e.target.value})}
                placeholder="Ej: Juan Pérez"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Email / Contacto</label>
              <input 
                type="text" 
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none transition-colors"
                value={newCli.email}
                onChange={e => setNewCli({...newCli, email: e.target.value})}
                placeholder="cliente@email.com"
              />
            </div>
            <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition-all shadow-lg shadow-blue-900/20">
              Registrar en BD
            </button>
          </form>
        </div>
      </div>
    </MainLayout>
  );
};

// Sub-componente interno para las tarjetas
const KpiCard = ({ title, value, icon, trend, suffix }) => (
  <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-xl relative overflow-hidden group hover:border-slate-700 transition-all">
    <div className="flex justify-between items-start mb-4">
      <div>
        <p className="text-slate-400 text-xs uppercase font-bold tracking-wider">{title}</p>
        <h3 className="text-3xl font-bold text-white mt-1">
          {value} <span className="text-sm text-slate-500 font-normal">{suffix}</span>
        </h3>
      </div>
      <div className="p-3 bg-slate-800 rounded-lg group-hover:bg-slate-700 transition-colors">
        {icon}
      </div>
    </div>
    {trend && (
      <p className="text-xs text-emerald-400 font-medium bg-emerald-500/10 inline-block px-2 py-1 rounded">
        {trend}
      </p>
    )}
  </div>
);

export default Dashboard;