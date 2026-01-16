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

console.log("✅ SERVIDOR CORRIGIDO (Diagnostico_Software + Catálogo)");

// --- RUTAS BÁSICAS ---
app.get('/', (req, res) => res.send('API PV360 v5.0 ONLINE'));

// 1. ANALYTICS
app.get('/api/analytics', (req, res) => {
    const kpis = `SELECT (SELECT COUNT(*) FROM ordenes_trabajo) as ots, IFNULL((SELECT SUM(total_facturado) FROM ordenes_trabajo), 0) as total, (SELECT COUNT(*) FROM vehiculos) as flota`;
    const chart = `SELECT v.modelo as name, SUM(ot.total_facturado) as valor FROM vehiculos v JOIN ordenes_trabajo ot ON v.id_vehiculo = ot.id_vehiculo GROUP BY v.modelo ORDER BY valor DESC LIMIT 5`;

    db.query(kpis, (err1, rKpis) => {
        if (err1) return res.json({ kpis: {ots:0, total:0, flota:0}, chartVehiculos: [] });
        db.query(chart, (err2, rChart) => {
            res.json({ kpis: rKpis[0], chartVehiculos: rChart || [] });
        });
    });
});

// 2. CLIENTES
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

// ==========================================
// 3. ÓRDENES DE TRABAJO (CORREGIDO)
// ==========================================

// LEER (Mapeamos diagnostico_software -> detalle para el frontend)
app.get('/api/ordenes', (req, res) => {
    const sql = `
        SELECT ot.id_ot, c.nombre_completo, ot.diagnostico_software as detalle, ot.total_facturado, ot.estado, ot.fecha 
        FROM ordenes_trabajo ot 
        LEFT JOIN clientes c ON ot.id_cliente = c.id_cliente 
        ORDER BY ot.id_ot DESC LIMIT 50
    `;
    db.query(sql, (err, rows) => res.json(rows || []));
});

// CREAR (AQUÍ ESTABA EL ERROR: Usamos 'diagnostico_software')
app.post('/api/ordenes', (req, res) => {
    const { id_cliente, detalle, total_facturado, estado } = req.body;
    
    // Validamos IDs por defecto (Usamos 1 porque vi en tus fotos que existen el empleado #1 y vehiculo #1)
    const sql = `
        INSERT INTO ordenes_trabajo 
        (id_cliente, diagnostico_software, total_facturado, estado, fecha, id_vehiculo, id_empleado, id_tecnico, id_asesor) 
        VALUES (?, ?, ?, ?, NOW(), 1, 1, 1, 1)
    `;

    // Pasamos la variable 'detalle' (del frontend) a la columna 'diagnostico_software' (de la DB)
    db.query(sql, [id_cliente, detalle, total_facturado || 0, estado || 'Pendiente'], (err, result) => {
        if (err) return res.status(500).json({ error: err.message }); // Esto te dirá el error exacto si falla
        res.json({ success: true, id: result.insertId });
    });
});

app.delete('/api/ordenes/:id', (req, res) => {
    db.query("DELETE FROM ordenes_trabajo WHERE id_ot = ?", [req.params.id], (err) => res.json({success: true}));
});

// ==========================================
// 4. CATÁLOGO DE SERVICIOS (NUEVO)
// ==========================================
app.get('/api/servicios', (req, res) => {
    // Usamos las columnas que vi en tu foto: nombre_servicio, precio_base
    db.query("SELECT id_servicio, nombre_servicio, precio_base FROM catalogo_servicios", (err, rows) => {
        if (err) return res.json([]);
        res.json(rows || []);
    });
});

// 5. REPORTES PDF
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
        doc.moveDown();
        doc.text(`Cliente: ${cliente.nombre_completo}`);
        doc.text(`Teléfono: ${cliente.telefono}`);
        doc.end();
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Puerto ${PORT}`));