const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// --- CONFIGURACIÓN DE LA BASE DE DATOS ---
// ⚠️ IMPORTANTE: Asegúrate de que estos datos coincidan con tu hosting real
const db = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '040407mgLl',
    database: process.env.DB_NAME || 'Post_venta_360', // OJO: En tu foto vi 'u123_pv360', verifica esto
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
});

console.log("✅ Servidor Backend: Activo y escuchando");

// RUTA DE PRUEBA
app.get('/', (req, res) => res.send('API PV360: Dashboard + Clientes Online 🚀'));

// ==========================================
// 📊 SECCIÓN 1: DASHBOARD (GRAFICOS Y KPIs)
// ==========================================
app.get('/api/analytics', (req, res) => {
    // Estas consultas calculan los números que ves en pantalla
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
        if (err1) {
            console.error("⚠️ Error KPIs:", err1);
            // Si falla, enviamos ceros para que no explote la app
            return res.json({ kpis: { ots: 0, total: 0, flota: 0 }, chartVehiculos: [] });
        }
        
        db.query(queries.vehiculos, (err2, resultChart) => {
            if (err2) console.error("⚠️ Error Gráfico:", err2);
            
            res.json({ 
                kpis: resultKpis[0], 
                chartVehiculos: resultChart || [] 
            });
        });
    });
});

// ==========================================
// 👥 SECCIÓN 2: CLIENTES (CRUD COMPLETO)
// ==========================================

// 1. LEER (GET)
app.get('/api/clientes', (req, res) => {
    db.query("SELECT * FROM clientes ORDER BY id_cliente DESC", (err, rows) => {
        if (err) {
            console.error(err);
            return res.status(500).send(err);
        }
        res.json(rows || []);
    });
});

// 2. CREAR (POST)
app.post('/api/clientes', (req, res) => {
    const { nombre, nombre_completo, email, telefono } = req.body;
    // Hacemos que funcione tanto si mandas 'nombre' como 'nombre_completo'
    const nombreFinal = nombre || nombre_completo;

    if (!nombreFinal) return res.status(400).json({ message: "Falta el nombre" });

    const sql = "INSERT INTO clientes (nombre_completo, email, telefono) VALUES (?, ?, ?)";
    db.query(sql, [nombreFinal, email, telefono || ''], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, id: result.insertId });
    });
});

// 3. ACTUALIZAR (PUT)
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

// 4. ELIMINAR (DELETE)
app.delete('/api/clientes/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM clientes WHERE id_cliente = ?', [id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Servidor corriendo en puerto ${PORT}`));