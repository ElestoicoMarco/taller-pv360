const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const PDFDocument = require('pdfkit'); // Asegúrate de haber instalado: npm install pdfkit

const app = express();

// IMPORTANTE: CORS permite que tu hosting de archivos hable con Render
app.use(cors({ origin: '*' }));
app.use(express.json());

// CONFIGURACIÓN BASE DE DATOS
const db = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '040407mgLl',
    database: process.env.DB_NAME || 'Post_venta_360',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
});

console.log("✅ API BACKEND ACTIVA (MODO PURO)");

// RUTA DE SALUD
app.get('/', (req, res) => res.send('API PV360 FUNCIONANDO - CONECTE DESDE EL FRONTEND'));

// ==========================================
// 1. ANALYTICS (DASHBOARD)
// ==========================================
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

// ==========================================
// 2. CLIENTES (CRUD)
// ==========================================
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
// 3. REPORTES PDF
// ==========================================
app.get('/api/reportes/cliente/:id', (req, res) => {
    const clientId = req.params.id;
    db.query("SELECT * FROM clientes WHERE id_cliente = ?", [clientId], (err, rows) => {
        if (err || rows.length === 0) return res.status(404).send("Cliente no encontrado");

        const cliente = rows[0];
        const doc = new PDFDocument();

        // Cabeceras para descarga
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Ficha_${cliente.nombre_completo.replace(/ /g,'_')}.pdf`);

        doc.pipe(res);

        // Contenido del PDF
        doc.fontSize(20).text('PV360 - FICHA DE CLIENTE', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Fecha: ${new Date().toLocaleDateString()}`, { align: 'right' });
        doc.rect(50, 130, 500, 2).fill('#3b82f6');
        doc.moveDown(2);
        
        doc.fillColor('black').fontSize(14).text(`DATOS DEL CLIENTE`, { bold: true });
        doc.moveDown(0.5);
        doc.fontSize(12).text(`ID Sistema: #${cliente.id_cliente}`);
        doc.text(`Nombre: ${cliente.nombre_completo}`);
        doc.text(`Email: ${cliente.email || '---'}`);
        doc.text(`Teléfono: ${cliente.telefono || '---'}`);
        
        doc.end();
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Puerto ${PORT}`));