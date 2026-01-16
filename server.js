require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const PDFDocument = require('pdfkit');

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

// CONFIGURACIÓN DE BASE DE DATOS
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
});

console.log("✅ SERVIDOR V9.0 - DASHBOARD ANALYTICS PRO");

// --- RUTAS API ---

app.get('/', (req, res) => res.send('API PV360 ONLINE v9.0'));

// 1. ANALYTICS AVANZADO (NUEVO)
app.get('/api/analytics', (req, res) => {
    // A. KPIs Generales
    const sqlKPIs = `
        SELECT 
            (SELECT COUNT(*) FROM ordenes_trabajo) as ots, 
            IFNULL((SELECT SUM(total_facturado) FROM ordenes_trabajo), 0) as total, 
            (SELECT COUNT(*) FROM vehiculos) as flota,
            (SELECT COUNT(*) FROM clientes) as clientes
    `;

    // B. Gráfico 1: Ingresos por Mes (Curva de Tendencia)
    // Agrupa por mes (YYYY-MM) usando tu columna 'fecha'
    const sqlIngresos = `
        SELECT DATE_FORMAT(fecha, '%Y-%m') as mes, SUM(total_facturado) as total 
        FROM ordenes_trabajo 
        GROUP BY mes 
        ORDER BY mes ASC 
        LIMIT 6
    `;

    // C. Gráfico 2: Marcas Más Atendidas (Ranking)
    // Conecta ordenes con vehiculos para ver qué marcas facturan más
    const sqlMarcas = `
        SELECT v.marca as name, COUNT(ot.id_ot) as cantidad, SUM(ot.total_facturado) as ventas
        FROM ordenes_trabajo ot 
        JOIN vehiculos v ON ot.id_vehiculo = v.id_vehiculo 
        GROUP BY v.marca 
        ORDER BY cantidad DESC 
        LIMIT 5
    `;

    // D. Gráfico 3: Estado de Caja (Donut)
    // Usa tu columna real 'estado_pago'
    const sqlEstados = `
        SELECT estado_pago as name, COUNT(*) as value 
        FROM ordenes_trabajo 
        GROUP BY estado_pago
    `;

    // Ejecución en cascada
    db.query(sqlKPIs, (err, rKPIs) => {
        if (err) return res.json({ kpis: {}, chartIngresos: [], chartMarcas: [], chartEstados: [] });
        
        db.query(sqlIngresos, (err2, rIngresos) => {
            db.query(sqlMarcas, (err3, rMarcas) => {
                db.query(sqlEstados, (err4, rEstados) => {
                    res.json({
                        kpis: rKPIs[0] || { ots:0, total:0, flota:0, clientes:0 },
                        chartIngresos: rIngresos || [],
                        chartMarcas: rMarcas || [],
                        chartEstados: rEstados || []
                    });
                });
            });
        });
    });
});

// 2. CLIENTES CRUD
app.get('/api/clientes', (req, res) => {
    db.query("SELECT * FROM clientes ORDER BY id_cliente DESC", (err, rows) => res.json(rows || []));
});
app.post('/api/clientes', (req, res) => {
    const { nombre, nombre_completo, email, telefono } = req.body;
    const nombreFinal = nombre || nombre_completo;
    if (!nombreFinal) return res.status(400).json({error: "Falta nombre"});
    db.query("INSERT INTO clientes (nombre_completo, email, telefono) VALUES (?, ?, ?)", 
        [nombreFinal, email, telefono || ''], (err, result) => res.json({success: true, id: result.insertId}));
});
app.put('/api/clientes/:id', (req, res) => {
    const { nombre, nombre_completo, email, telefono } = req.body;
    db.query("UPDATE clientes SET nombre_completo = ?, email = ?, telefono = ? WHERE id_cliente = ?", 
        [nombre || nombre_completo, email, telefono, req.params.id], (err) => res.json({success: true}));
});
app.delete('/api/clientes/:id', (req, res) => {
    db.query("DELETE FROM clientes WHERE id_cliente = ?", [req.params.id], (err) => res.json({success: true}));
});

// 3. ÓRDENES DE TRABAJO
app.get('/api/ordenes', (req, res) => {
    const sql = `SELECT ot.id_ot, c.nombre_completo, ot.diagnostico_software as detalle, ot.total_facturado, ot.estado_pago as estado, ot.fecha FROM ordenes_trabajo ot LEFT JOIN clientes c ON ot.id_cliente = c.id_cliente ORDER BY ot.id_ot DESC LIMIT 50`;
    db.query(sql, (err, rows) => res.json(rows || []));
});
app.post('/api/ordenes', (req, res) => {
    const { id_cliente, detalle, total_facturado, estado } = req.body;
    const sql = `INSERT INTO ordenes_trabajo (id_cliente, diagnostico_software, total_facturado, estado_pago, fecha, id_vehiculo, id_empleado, id_tecnico, id_asesor) VALUES (?, ?, ?, ?, NOW(), 1, 1, 1, 1)`;
    db.query(sql, [id_cliente, detalle, total_facturado || 0, estado || 'Pendiente'], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, id: result.insertId });
    });
});
app.delete('/api/ordenes/:id', (req, res) => {
    db.query("DELETE FROM ordenes_trabajo WHERE id_ot = ?", [req.params.id], (err) => res.json({success: true}));
});

// 4. CATÁLOGO
app.get('/api/servicios', (req, res) => {
    db.query("SELECT id_servicio, nombre_servicio, precio_base FROM catalogo_servicios", (err, rows) => {
        if (err) return res.json([]);
        res.json(rows || []);
    });
});

// 5. REPORTES
app.get('/api/reportes/cliente/:id', (req, res) => {
    const clientId = req.params.id;
    db.query("SELECT * FROM clientes WHERE id_cliente = ?", [clientId], (err, rows) => {
        if (err || rows.length === 0) return res.status(404).send("Cliente no encontrado");
        const cliente = rows[0];
        const doc = new PDFDocument();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Ficha_${cliente.nombre_completo.replace(/ /g,'_')}.pdf`);
        doc.pipe(res);
        doc.fontSize(20).text('FICHA DE CLIENTE', { align: 'center' });
        doc.text(`Cliente: ${cliente.nombre_completo}`);
        doc.end();
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Puerto ${PORT}`));