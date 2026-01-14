const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
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

console.log("✅ Servidor Iniciado");

// PING PARA MANTENER VIVA LA DB
setInterval(() => {
    db.query('SELECT 1', (err) => { if (err) console.error('Ping DB falló'); });
}, 120000);

app.get('/', (req, res) => res.send('Backend PV360 Online'));

// 1. LISTAR
app.get('/api/clientes', (req, res) => {
    db.query("SELECT * FROM clientes ORDER BY id_cliente DESC", (err, rows) => {
        if (err) return res.status(500).send(err);
        res.json(rows || []);
    });
});

// 2. CREAR (POST)
app.post('/api/clientes', (req, res) => {
    const { nombre_completo, email, telefono } = req.body;
    const telefonoFinal = telefono || 'Sin Numero';

    if (!nombre_completo) return res.status(400).json({message: "Falta nombre"});

    const sql = "INSERT INTO clientes (nombre_completo, email, telefono) VALUES (?, ?, ?)";
    db.query(sql, [nombre_completo, email, telefonoFinal], (err, result) => {
        if (err) return res.status(500).json({ message: err.message });
        res.json({ success: true, id: result.insertId });
    });
});

// 3. EDITAR (PUT) - CORREGIDO
app.put('/api/clientes/:id', (req, res) => {
    const { id } = req.params;
    const { nombre_completo, email, telefono } = req.body;
    
    // Validación de seguridad
    if (!id || !nombre_completo) return res.status(400).json({ error: "Datos incompletos" });

    const sql = 'UPDATE clientes SET nombre_completo = ?, email = ?, telefono = ? WHERE id_cliente = ?';
    db.query(sql, [nombre_completo, email, telefono, id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, message: "Actualizado" });
    });
});

// 4. ELIMINAR (DELETE) - CORREGIDO
app.delete('/api/clientes/:id', (req, res) => {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "Falta ID" });

    db.query('DELETE FROM clientes WHERE id_cliente = ?', [id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, message: "Eliminado" });
    });
});

app.listen(5000, () => console.log('🚀 Puerto 5000'));