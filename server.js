const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors({ origin: '*' })); // Permitir todo
app.use(express.json());

// DB CONFIG
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

console.log("✅ Backend ACTIVO");

// --- ANALYTICS (GRAFICOS) ---
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

// --- CLIENTES CRUD ---

// LEER
app.get('/api/clientes', (req, res) => {
    db.query("SELECT * FROM clientes ORDER BY id_cliente DESC", (err, rows) => {
        if (err) return res.status(500).json({error: err.message});
        res.json(rows || []);
    });
});

// CREAR
app.post('/api/clientes', (req, res) => {
    const { nombre, nombre_completo, email, telefono } = req.body;
    const nombreFinal = nombre || nombre_completo;
    if (!nombreFinal) return res.status(400).json({error: "Falta nombre"});

    const sql = "INSERT INTO clientes (nombre_completo, email, telefono) VALUES (?, ?, ?)";
    db.query(sql, [nombreFinal, email, telefono || ''], (err, result) => {
        if (err) return res.status(500).json({error: err.message});
        res.json({success: true, id: result.insertId});
    });
});

// ACTUALIZAR (UPDATE)
app.put('/api/clientes/:id', (req, res) => {
    const { id } = req.params;
    const { nombre, nombre_completo, email, telefono } = req.body;
    const nombreFinal = nombre || nombre_completo;

    console.log(`🔄 EDITAR ID: ${id}`);

    const sql = "UPDATE clientes SET nombre_completo = ?, email = ?, telefono = ? WHERE id_cliente = ?";
    db.query(sql, [nombreFinal, email, telefono, id], (err, result) => {
        if (err) return res.status(500).json({error: err.message});
        res.json({success: true});
    });
});

// ELIMINAR (DELETE)
app.delete('/api/clientes/:id', (req, res) => {
    const { id } = req.params;
    console.log(`🗑️ BORRAR ID: ${id}`);

    const sql = "DELETE FROM clientes WHERE id_cliente = ?";
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json({error: err.message});
        res.json({success: true});
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Puerto ${PORT}`));