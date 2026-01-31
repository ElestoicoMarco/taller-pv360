import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie, Legend,
  ScatterChart, Scatter, ZAxis
} from 'recharts';
import { DollarSign, Activity, Users, CheckCircle, Car, TrendingUp, Calendar, Zap, Box } from 'lucide-react';
import MainLayout from '../components/Layout/MainLayout';
import LoadingScreen from '../components/LoadingScreen';

// COLORES NEON & GRADIENTES
const COLORS_DONUT = ['#8B5CF6', '#3B82F6', '#06B6D4', '#10B981']; // Purple, Blue, Cyan, Emerald (Neon Palette)

const Dashboard = () => {
  const [data, setData] = useState({
    kpis: { ots: 0, total: 0, flota: 0, clientes: 0 },
    chartIngresos: [],
    chartMarcas: [],
    chartEstados: []
  });

  const [loading, setLoading] = useState(true);

  // 2. CARGA DE DATOS
  const loadDashboard = useCallback(async () => {
    try {
      const res = await axios.get('https://taller-pv360-rejl.onrender.com/api/analytics');
      setData(res.data || { kpis: {}, chartIngresos: [], chartMarcas: [], chartEstados: [] });
    } catch (err) {
      console.error("Error cargando dashboard:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  return (
    <MainLayout>
      {/* PANTALLA DE CARGA (Overlay) */}
      {loading && <LoadingScreen />}

      {/* CABECERA */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard</h1>
          <p className="text-slate-400 mt-1">Hola, bienvenido de nuevo a PV-360 PRO</p>
        </div>

        {/* FILTRO DE FECHA (VISUAL) */}
        <div className="flex items-center gap-3 bg-slate-900/80 backdrop-blur-md p-2 rounded-xl border border-slate-800 shadow-lg">
          <div className="p-2 bg-slate-800 rounded-lg text-blue-400">
            <Calendar size={18} />
          </div>
          <div className="text-xs mr-2">
            <span className="text-slate-500 block">Filtro Periodo</span>
            <span className="text-white font-bold">Ultimos 30 días</span>
          </div>
        </div>
      </div>

      {/* --- FILA 1: KPIs (TARJETAS GLASS) --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KpiCard
          title="Total Facturado"
          value={`$ ${Number(data.kpis.total || 0).toLocaleString('es-AR')}`}
          icon={<DollarSign size={24} className="text-cyan-400" />}
          gradient="from-cyan-500/20 to-blue-500/5"
          borderColor="border-cyan-500/20"
          shadowColor="rgba(6,182,212,0.3)"
          trend="+12% (30 días)"
          trendColor="text-emerald-400"
        />
        <KpiCard
          title="Órdenes Activas"
          value={data.kpis.ots || 0}
          icon={<Zap size={24} className="text-purple-400" />}
          gradient="from-purple-500/20 to-pink-500/5"
          borderColor="border-purple-500/20"
          shadowColor="rgba(168,85,247,0.3)"
          trend="+5 Nuevas"
          trendColor="text-purple-400"
        />
        <KpiCard
          title="Flota Atendida"
          value={data.kpis.flota || 0}
          icon={<Car size={24} className="text-orange-400" />}
          gradient="from-orange-500/20 to-red-500/5"
          borderColor="border-orange-500/20"
          shadowColor="rgba(249,115,22,0.3)"
          trend="Estable"
          trendColor="text-slate-400"
        />
        <KpiCard
          title="Cartera Clientes"
          value={data.kpis.clientes || 0}
          icon={<Users size={24} className="text-emerald-400" />}
          gradient="from-emerald-500/20 to-teal-500/5"
          borderColor="border-emerald-500/20"
          shadowColor="rgba(16,185,129,0.3)"
          trend="+2% Crecimiento"
          trendColor="text-emerald-400"
        />
      </div>

      {/* --- FILA 2: GRÁFICOS PRINCIPALES --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

        {/* GRÁFICO 1: SALES ANALYSIS (Donuts) */}
        <div className="lg:col-span-1 bg-slate-900/50 backdrop-blur-md p-6 rounded-2xl border border-slate-700/50 shadow-xl flex flex-col justify-between">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-white font-bold text-lg">Análisis de Órdenes</h3>
            <Box size={20} className="text-slate-500" />
          </div>

          <div className="h-[250px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <defs>
                  <filter id="donutGlow" height="130%">
                    <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur" />
                    <feFlood floodColor="white" result="color" />
                    <feComposite in="color" in2="blur" operator="in" result="shadow" />
                    <feMerge>
                      <feMergeNode in="shadow" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                <Pie
                  data={data.chartEstados}
                  cy="45%"
                  innerRadius={70}
                  outerRadius={85}
                  cornerRadius={6}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                  filter="url(#donutGlow)"
                >
                  {data.chartEstados.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS_DONUT[index % COLORS_DONUT.length]} stroke="rgba(0,0,0,0)" />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-12">
              <span className="text-4xl font-bold text-white drop-shadow-lg filter">{data.chartEstados.reduce((acc, curr) => acc + curr.value, 0)}</span>
              <span className="text-xs text-slate-400 font-medium tracking-widest uppercase">Total</span>
            </div>
          </div>
        </div>

        {/* GRÁFICO 2: INGRESOS VS GANANCIA (Dual Area) - Neon Style */}
        <div className="lg:col-span-2 bg-slate-900/50 backdrop-blur-md p-6 rounded-2xl border border-slate-700/50 shadow-xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent pointer-events-none" />

          <div className="flex justify-between items-center mb-6 relative z-10">
            <div>
              <h3 className="text-white font-bold text-lg">Finanzas: Ingresos vs Ganancia</h3>
              <p className="text-xs text-slate-400">Comparativa de facturación bruta y ganancia neta</p>
            </div>
            <div className="bg-slate-800 rounded-lg p-2">
              <TrendingUp size={20} className="text-cyan-400" />
            </div>
          </div>

          <div className="h-[280px] w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.chartIngresos}>
                <defs>
                  <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorGanancia" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                  <filter id="areaGlow" height="130%">
                    <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="blur" />
                    <feFlood floodColor="rgba(6,182,212,0.4)" result="color" />
                    <feComposite in="color" in2="blur" operator="in" result="shadow" />
                    <feMerge>
                      <feMergeNode in="shadow" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis
                  dataKey="mes"
                  stroke="#475569"
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  dy={10}
                />
                <YAxis
                  stroke="#475569"
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `$${v / 1000}k`}
                  dx={-10}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(8px)', borderColor: '#334155', color: '#fff', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  name="Ingreso Bruto"
                  stroke="#06B6D4"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorIngresos)"
                  filter="url(#areaGlow)"
                />
                <Area
                  type="monotone"
                  dataKey="ganancia"
                  name="Ganancia Neta"
                  stroke="#10B981"
                  strokeDasharray="5 5"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorGanancia)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* --- FILA 3: ÚLTIMA SECCIÓN (Top Marcas & Heatmap) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* GRÁFICO 3: TOP MARCAS (Bar Chart Horizontal) - Premium Style */}
        <div className="lg:col-span-2 bg-slate-900/50 backdrop-blur-md p-6 rounded-2xl border border-slate-700/50 shadow-xl relative overflow-hidden">
          {/* Glow Effect Background */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2 relative z-10">
            <span className="w-1 h-6 bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.8)]"></span> Top Marcas Atendidas
          </h3>
          <div className="h-80 w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.chartMarcas} layout="vertical" barSize={24} margin={{ left: 20 }}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="100%" stopColor="#06B6D4" />
                  </linearGradient>
                  <filter id="neonGlow" height="130%">
                    <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="blur" />
                    <feFlood floodColor="rgba(6, 182, 212, 0.5)" result="color" />
                    <feComposite in="color" in2="blur" operator="in" result="shadow" />
                    <feMerge>
                      <feMergeNode in="shadow" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#1e293b" />
                <XAxis type="number" stroke="#475569" hide />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" width={100} tick={{ fill: '#cbd5e1', fontSize: 13, fontWeight: '600' }} />
                <Tooltip
                  cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }}
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', borderColor: '#334155', color: '#fff', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}
                  itemStyle={{ color: '#bae6fd' }}
                />
                <Bar dataKey="cantidad" radius={[0, 6, 6, 0]} fill="url(#barGradient)" filter="url(#neonGlow)" animationDuration={1500} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* GRÁFICO 4: SCATTER PLOT - Premium Style */}
        <div className="flex-1 w-full relative bg-slate-900/50 backdrop-blur-md p-6 rounded-2xl border border-slate-700/50 shadow-xl overflow-hidden flex flex-col">
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl -ml-5 -mb-5 pointer-events-none"></div>

          <div className="mb-4 relative z-10">
            <h3 className="text-lg font-bold text-white leading-tight">
              Análisis: Marcas
            </h3>
            <p className="text-xs text-slate-400">Volumen vs Facturación</p>
          </div>

          <div className="flex-1 w-full relative z-10">
            <ResponsiveContainer width="100%" height={200}>
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
                <defs>
                  <linearGradient id="scatterDotGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F472B6" />
                    <stop offset="100%" stopColor="#A855F7" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" dataKey="cantidad" name="Vehículos" stroke="#64748b" unit=" un." tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={{ stroke: '#334155' }} />
                <YAxis type="number" dataKey="ventas" name="Facturación" stroke="#64748b" tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`} tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={{ stroke: '#334155' }} width={40} />
                <ZAxis type="category" dataKey="name" name="Marca" />
                <Tooltip cursor={{ strokeDasharray: '3 3', stroke: '#475569' }} contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', borderColor: '#334155', color: '#fff', fontSize: '12px', borderRadius: '8px' }} formatter={(value, name) => [name === 'ventas' ? `$${Number(value).toLocaleString()}` : value, name === 'ventas' ? 'Facturación' : 'Vehículos']} />
                <Scatter name="Marcas" data={data.chartMarcas} fill="url(#scatterDotGradient)" shape="circle" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-2 text-center text-xs text-slate-500 border-t border-slate-800/50 pt-3 relative z-10">
            Cant. Vehículos vs Total Facturado
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

// Componente KpiCard Estilo Neon/Glass
const KpiCard = ({ title, value, icon, gradient, borderColor, shadowColor, trend, trendColor }) => (
  <div
    className={`relative p-6 rounded-2xl bg-gradient-to-br ${gradient} border ${borderColor} backdrop-blur-md transition-all hover:-translate-y-1 group`}
    style={{ boxShadow: `0 4px 24px -1px ${shadowColor || 'rgba(0,0,0,0.2)'}` }}
  >

    {/* Icono con Glow */}
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 shadow-inner">
        {icon}
      </div>
      {trend && (
        <span className={`text-xs font-bold ${trendColor} flex items-center gap-1 bg-slate-900/40 px-2 py-1 rounded-full`}>
          {trend.includes('+') ? <TrendingUp size={12} /> : null}
          {trend}
        </span>
      )}
    </div>

    <div>
      <h3 className="text-2xl font-bold text-white mb-1 group-hover:text-blue-100 transition-colors">{value}</h3>
      <p className="text-slate-400 text-sm font-medium">{title}</p>
    </div>

    {/* Decoración Neon */}
    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
  </div>
);




// Custom Shape para Box Plot
export default Dashboard;