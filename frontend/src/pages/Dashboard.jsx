import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell, PieChart, Pie, Legend 
} from 'recharts';
import { DollarSign, Activity, Users, CheckCircle, Plus, Car, TrendingUp } from 'lucide-react';
import MainLayout from '../components/Layout/MainLayout';

// COLORES MODERNOS
const COLORS_DONUT = ['#10B981', '#F59E0B', '#EF4444', '#3B82F6'];

const Dashboard = () => {
  // 1. ESTADOS (Adaptados a la nueva respuesta del backend v9.0)
  const [data, setData] = useState({
    kpis: { ots: 0, total: 0, flota: 0, clientes: 0 },
    chartIngresos: [],
    chartMarcas: [],
    chartEstados: []
  });
  
  const [newCli, setNewCli] = useState({ nombre: '', email: '' });
  const [loading, setLoading] = useState(true);

  // 2. CARGA DE DATOS (Conecta con tu server v9.0)
  const loadDashboard = useCallback(async () => {
    try {
      const res = await axios.get('https://taller-pv360-c69q.onrender.com/api/analytics');
      // Si el backend devuelve estructura vieja o nueva, tratamos de adaptarnos, 
      // pero idealmente esperamos la estructura v9.0
      setData(res.data || { kpis: {}, chartIngresos: [], chartMarcas: [], chartEstados: [] });
      setLoading(false);
    } catch (err) {
      console.error("Error cargando dashboard:", err);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  // 3. GUARDAR CLIENTE (TU LÓGICA INTACTA)
  const handleSaveClient = async (e) => {
    e.preventDefault();
    if (!newCli.nombre || !newCli.email) return alert("Por favor complete nombre y email");

    try {
      const payload = {
        nombre: newCli.nombre,
        email: newCli.email,
        telefono: '0' // Hack para evitar error de DB
      };

      const res = await axios.post('https://taller-pv360-c69q.onrender.com/api/clientes', payload);

      if (res.data.success) {
        setNewCli({ nombre: '', email: '' });
        alert("¡Cliente registrado con éxito!");
        loadDashboard(); 
      }
    } catch (err) {
      console.error(err);
      alert("Error al guardar: " + (err.response?.data?.message || err.message));
    }
  };

  if (loading) return <MainLayout><div className="p-10 text-white">Cargando Panel de Control...</div></MainLayout>;

  return (
    <MainLayout>
      {/* CABECERA */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Panel de Control</h1>
          <p className="text-slate-400">Resumen financiero y operativo en tiempo real</p>
        </div>
        <div className="bg-emerald-500/10 text-emerald-400 px-4 py-2 rounded-full text-xs font-bold border border-emerald-500/20 flex items-center gap-2">
          <CheckCircle size={14} /> Sistema Online v9.0
        </div>
      </div>

      {/* --- FILA 1: KPIs (TARJETAS) --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KpiCard 
          title="Facturación Total" 
          value={`$ ${Number(data.kpis.total || 0).toLocaleString('es-AR')}`} 
          icon={<DollarSign size={24}/>} 
          color="text-emerald-400" 
          bg="bg-emerald-500/10" 
          border="border-emerald-500/20"
        />
        <KpiCard 
          title="Órdenes Activas" 
          value={data.kpis.ots || 0} 
          icon={<Activity size={24}/>} 
          color="text-blue-400" 
          bg="bg-blue-500/10" 
          border="border-blue-500/20"
        />
        <KpiCard 
          title="Flota Atendida" 
          value={data.kpis.flota || 0} 
          icon={<Car size={24}/>} 
          color="text-orange-400" 
          bg="bg-orange-500/10" 
          border="border-orange-500/20"
        />
        <KpiCard 
          title="Total Clientes" 
          value={data.kpis.clientes || 0} 
          icon={<Users size={24}/>} 
          color="text-purple-400" 
          bg="bg-purple-500/10" 
          border="border-purple-500/20"
        />
      </div>

      {/* --- FILA 2: GRÁFICOS PRINCIPALES (NUEVO) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        
        {/* GRÁFICO 1: EVOLUCIÓN DE INGRESOS (Area Chart) - Ocupa 2 columnas */}
        <div className="lg:col-span-2 bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-5"><TrendingUp size={100} color="white"/></div>
             <h3 className="text-white font-bold mb-6 text-lg flex items-center gap-2">
                <span className="w-1 h-6 bg-blue-500 rounded-full"></span> Tendencia de Ingresos
             </h3>
             <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.chartIngresos}>
                    <defs>
                      <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="mes" stroke="#64748b" tick={{fill: '#94a3b8', fontSize: 12}} axisLine={false} tickLine={false} />
                    <YAxis stroke="#64748b" tick={{fill: '#94a3b8', fontSize: 12}} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v/1000}k`} />
                    <Tooltip contentStyle={{backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', borderRadius: '8px'}} />
                    <Area type="monotone" dataKey="total" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorIngresos)" />
                  </AreaChart>
                </ResponsiveContainer>
             </div>
        </div>

        {/* GRÁFICO 2: ESTADO DE CAJA (Donut Chart) - Ocupa 1 columna */}
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-xl">
             <h3 className="text-white font-bold mb-6 text-lg flex items-center gap-2">
                <span className="w-1 h-6 bg-emerald-500 rounded-full"></span> Estado de Pagos
             </h3>
             <div className="h-[280px] relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={data.chartEstados} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                      {data.chartEstados.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS_DONUT[index % COLORS_DONUT.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color:'#fff'}} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle"/>
                  </PieChart>
                </ResponsiveContainer>
                {/* Centro del Donut */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
                    <span className="text-3xl font-bold text-white">{data.chartEstados.reduce((acc, curr) => acc + curr.value, 0)}</span>
                    <span className="text-xs text-slate-500 uppercase font-bold">Órdenes</span>
                </div>
             </div>
        </div>
      </div>

      {/* --- FILA 3: RANKING MARCAS Y FORMULARIO (Mantenemos tu estructura) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* GRÁFICO 3: MARCAS (Horizontal Bar) - Reemplaza al viejo vertical */}
        <div className="lg:col-span-2 bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-xl">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <span className="w-1 h-6 bg-orange-500 rounded-full"></span> Top Marcas Atendidas
          </h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.chartMarcas} layout="vertical" barSize={20} margin={{left: 20}}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#334155" />
                <XAxis type="number" stroke="#64748b" hide />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" width={100} tick={{fill: '#cbd5e1', fontSize: 12, fontWeight: 'bold'}} />
                <Tooltip cursor={{fill: '#1e293b'}} contentStyle={{backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', borderRadius: '8px'}} />
                <Bar dataKey="cantidad" radius={[0, 4, 4, 0]}>
                   {data.chartMarcas.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#F97316' : '#ea580c'} />
                   ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* TU FORMULARIO ORIGINAL (INTACTO) */}
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

// Componente KpiCard optimizado
const KpiCard = ({ title, value, icon, color, bg, border }) => (
    <div className={`p-6 rounded-xl border ${border} ${bg} backdrop-blur-sm flex items-center gap-4 transition-transform hover:scale-[1.02]`}>
        <div className={`p-3 rounded-lg bg-slate-950/50 ${color} shadow-lg`}>
            {icon}
        </div>
        <div>
            <p className="text-slate-400 text-xs uppercase font-bold tracking-wider">{title}</p>
            <h3 className="text-2xl font-bold text-white mt-1">{value}</h3>
        </div>
    </div>
);

export default Dashboard;