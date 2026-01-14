const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// CONFIGURACIÓN DE LA BASE DE DATOS
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

console.log("✅ Servidor Backend Restaurado y Listo");

// RUTA DE PRUEBA
app.get('/', (req, res) => res.send('API PV360 Funcionando'));

// 1. LEER CLIENTES (GET)
app.get('/api/clientes', (req, res) => {
    db.query("SELECT * FROM clientes ORDER BY id_cliente DESC", (err, rows) => {
        if (err) return res.status(500).send(err);
        res.json(rows || []);
    });
});

// 2. CREAR CLIENTE (POST)
app.post('/api/clientes', (req, res) => {
    const { nombre, nombre_completo, email, telefono } = req.body;
    const nombreFinal = nombre || nombre_completo;

    if (!nombreFinal) return res.status(400).json({ message: "Falta el nombre" });

    const sql = "INSERT INTO clientes (nombre_completo, email, telefono) VALUES (?, ?, ?)";
    db.query(sql, [nombreFinal, email, telefono || ''], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, id: result.insertId });
    });
});

// 3. ACTUALIZAR CLIENTE (PUT)
app.put('/api/clientes/:id', (req, res) => {
    const { id } = req.params;
    const { nombre, nombre_completo, email, telefono } = req.body;
    const nombreFinal = nombre || nombre_completo;

    const sql = 'UPDATE clientes SET nombre_completo = ?, email = ?, telefono = ? WHERE id_cliente = ?';
    db.query(sql, [nombreFinal, email, telefono, id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

// 4. ELIMINAR CLIENTE (DELETE)
app.delete('/api/clientes/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM clientes WHERE id_cliente = ?', [id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Servidor corriendo en puerto ${PORT}`));