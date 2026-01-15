const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
// Configuración CORS permisiva para evitar bloqueos
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

console.log("✅ Servidor Backend: LISTO PARA RECIBIR ORDENES");

// RUTA BASE
app.get('/', (req, res) => res.send('API PV360 Online 🚀'));

// ==========================================
// 📊 GRÁFICOS (DASHBOARD)
// ==========================================
app.get('/api/analytics', (req, res) => {
    const queries = {
        kpis: `SELECT 
                (SELECT COUNT(*) FROM ordenes_trabajo) as ots,
                IFNULL((SELECT SUM(total_facturado) FROM ordenes_trabajo), 0) as total,
                (SELECT COUNT(*) FROM vehiculos) as flota`,
        vehiculos: `SELECT v.modelo as name, SUM(ot.total_facturado) as valor 
                    FROM vehiculos v 
                    JOIN ordenes_trabajo ot ON v.id_vehiculo = ot.id_vehiculo 
                    GROUP BY v.modelo ORDER BY valor DESC LIMIT 5`
    };

    db.query(queries.kpis, (err1, resultKpis) => {
        if (err1) return res.json({ kpis: { ots: 0, total: 0, flota: 0 }, chartVehiculos: [] });
        
        db.query(queries.vehiculos, (err2, resultChart) => {
            res.json({ kpis: resultKpis[0], chartVehiculos: resultChart || [] });
        });
    });
});

// ==========================================
// 👥 CLIENTES (CRUD BLINDADO)
// ==========================================

// 1. LEER
app.get('/api/clientes', (req, res) => {
    db.query("SELECT * FROM clientes ORDER BY id_cliente DESC", (err, rows) => {
        if (err) return res.status(500).send(err);
        res.json(rows || []);
    });
});

// 2. CREAR
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

// 3. EDITAR (UPDATE) - CON VERIFICACIÓN DE ID
app.put('/api/clientes/:id', (req, res) => {
    const { id } = req.params;
    const { nombre, nombre_completo, email, telefono } = req.body;
    const nombreFinal = nombre || nombre_completo;

    console.log(`🔄 PETICIÓN UPDATE RECIBIDA PARA ID: ${id}`); // Log para Render

    const sql = 'UPDATE clientes SET nombre_completo = ?, email = ?, telefono = ? WHERE id_cliente = ?';
    db.query(sql, [nombreFinal, email, telefono, id], (err, result) => {
        if (err) {
            console.error("❌ Error SQL:", err);
            return res.status(500).json({ error: err.message });
        }
        
        // LA CLAVE: Si no afectó ninguna fila, es que el ID no existe
        if (result.affectedRows === 0) {
            console.warn("⚠️ ALERTA: ID no encontrado en DB");
            return res.status(404).json({ error: "No se encontró el cliente con ese ID" });
        }

        console.log("✅ Cliente actualizado con éxito");
        res.json({ success: true });
    });
});

// 4. ELIMINAR (DELETE) - CON VERIFICACIÓN DE ID
app.delete('/api/clientes/:id', (req, res) => {
    const { id } = req.params;
    console.log(`🗑️ PETICIÓN DELETE RECIBIDA PARA ID: ${id}`); // Log para Render

    const sql = 'DELETE FROM clientes WHERE id_cliente = ?';
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        // LA CLAVE: Verificamos si realmente borró algo
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "No se pudo borrar: ID no encontrado" });
        }

        console.log("✅ Cliente eliminado con éxito");
        res.json({ success: true });
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Servidor en puerto ${PORT}`));