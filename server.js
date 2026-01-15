const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');
const PDFDocument = require('pdfkit'); // 👈 NUEVO: IMPORTAR LIBRERIA PDF

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

// CONFIG DB
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

console.log("✅ SERVER ACTIVO CON GENERADOR PDF");

// ROUTES BÁSICAS
app.get('/', (req, res) => res.send('API PV360 ONLINE v3.0'));

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

// ============================================
// 📄 NUEVO: GENERADOR DE REPORTES PDF
// ============================================
app.get('/api/reportes/cliente/:id', (req, res) => {
    const clientId = req.params.id;

    // 1. Buscar datos del cliente
    db.query("SELECT * FROM clientes WHERE id_cliente = ?", [clientId], (err, rows) => {
        if (err || rows.length === 0) return res.status(404).send("Cliente no encontrado");

        const cliente = rows[0];

        // 2. Crear documento PDF
        const doc = new PDFDocument();

        // 3. Configurar cabeceras para descargar el archivo
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Ficha_Cliente_${cliente.id_cliente}.pdf`);

        doc.pipe(res); // Enviar PDF directo al navegador

        // 4. DISEÑO DEL PDF
        doc.fontSize(20).text('PV360 - FICHA DE CLIENTE', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Fecha de emisión: ${new Date().toLocaleDateString()}`, { align: 'right' });
        doc.moveDown();
        
        doc.rect(50, 130, 500, 2).fill('#3b82f6'); // Línea azul decorativa
        doc.moveDown(2);
        
        doc.fillColor('black').fontSize(14).text(`CLIENTE #${cliente.id_cliente}`, { bold: true });
        doc.moveDown(0.5);
        doc.fontSize(12).text(`Nombre: ${cliente.nombre_completo}`);
        doc.text(`Email: ${cliente.email || 'No registrado'}`);
        doc.text(`Teléfono: ${cliente.telefono || 'No registrado'}`);
        doc.text(`Ciudad: ${cliente.ciudad || 'No registrada'}`);
        
        doc.moveDown(2);
        doc.fontSize(10).text('Este documento es un reporte generado automáticamente por el sistema PV360.', { align: 'center', color: 'gray' });

        doc.end(); // Finalizar PDF
    });
});

// BUILD STATIC (Para que Render cree el frontend si usas esa opción)
app.use(express.static(path.join(__dirname, 'frontend/build')));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'frontend/build', 'index.html')));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Puerto ${PORT}`));