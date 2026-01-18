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

console.log("✅ SERVIDOR V9.5 - REPORTE EJECUTIVO PDF ACTIVO");

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
    const sqlIngresos = `
        SELECT DATE_FORMAT(fecha, '%Y-%m') as mes, SUM(total_facturado) as total 
        FROM ordenes_trabajo 
        GROUP BY mes 
        ORDER BY mes ASC 
        LIMIT 6
    `;

    // C. Gráfico 2: Marcas Más Atendidas (Ranking)
    const sqlMarcas = `
        SELECT v.marca as name, COUNT(ot.id_ot) as cantidad, SUM(ot.total_facturado) as ventas
        FROM ordenes_trabajo ot 
        JOIN vehiculos v ON ot.id_vehiculo = v.id_vehiculo 
        GROUP BY v.marca 
        ORDER BY cantidad DESC 
        LIMIT 5
    `;

    // D. Gráfico 3: Estado de Caja (Donut)
    const sqlEstados = `
        SELECT estado_pago as name, COUNT(*) as value 
        FROM ordenes_trabajo 
        GROUP BY estado_pago
    `;

    db.query(sqlKPIs, (err, rKPIs) => {
        if (err) return res.json({ kpis: {}, chartIngresos: [], chartMarcas: [], chartEstados: [] });

        db.query(sqlIngresos, (err2, rIngresos) => {
            db.query(sqlMarcas, (err3, rMarcas) => {
                db.query(sqlEstados, (err4, rEstados) => {
                    res.json({
                        kpis: rKPIs[0] || { ots: 0, total: 0, flota: 0, clientes: 0 },
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
    if (!nombreFinal) return res.status(400).json({ error: "Falta nombre" });
    db.query("INSERT INTO clientes (nombre_completo, email, telefono) VALUES (?, ?, ?)",
        [nombreFinal, email, telefono || ''], (err, result) => res.json({ success: true, id: result.insertId }));
});
app.put('/api/clientes/:id', (req, res) => {
    const { nombre, nombre_completo, email, telefono } = req.body;
    db.query("UPDATE clientes SET nombre_completo = ?, email = ?, telefono = ? WHERE id_cliente = ?",
        [nombre || nombre_completo, email, telefono, req.params.id], (err) => res.json({ success: true }));
});
app.delete('/api/clientes/:id', (req, res) => {
    db.query("DELETE FROM clientes WHERE id_cliente = ?", [req.params.id], (err) => res.json({ success: true }));
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
app.put('/api/ordenes/:id', (req, res) => {
    const { id_cliente, detalle, total_facturado, estado } = req.body;
    const sql = `UPDATE ordenes_trabajo SET id_cliente = ?, diagnostico_software = ?, total_facturado = ?, estado_pago = ? WHERE id_ot = ?`;
    db.query(sql, [id_cliente, detalle, total_facturado, estado, req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});
app.delete('/api/ordenes/:id', (req, res) => {
    db.query("DELETE FROM ordenes_trabajo WHERE id_ot = ?", [req.params.id], (err) => res.json({ success: true }));
});

// 4. CATÁLOGO
app.get('/api/servicios', (req, res) => {
    db.query("SELECT id_servicio, nombre_servicio, precio_base FROM catalogo_servicios", (err, rows) => {
        if (err) return res.json([]);
        res.json(rows || []);
    });
});

// 5. REPORTES EJECUTIVOS (MODIFICADO)
app.get('/api/reportes/cliente/:id', (req, res) => {
    const clientId = req.params.id;

    // 1. Obtener Datos del Cliente
    db.query("SELECT * FROM clientes WHERE id_cliente = ?", [clientId], (err, rows) => {
        if (err || rows.length === 0) return res.status(404).send("Cliente no encontrado");
        const cliente = rows[0];

        // 2. Obtener Historial Completo (Orden + Vehiculo)
        const sqlHistorial = `
            SELECT 
                ot.fecha, 
                ot.diagnostico_software, 
                ot.total_facturado, 
                ot.estado_pago,
                v.marca, 
                v.modelo, 
                v.patente 
            FROM ordenes_trabajo ot 
            LEFT JOIN vehiculos v ON ot.id_vehiculo = v.id_vehiculo 
            WHERE ot.id_cliente = ? 
            ORDER BY ot.fecha DESC
        `;

        db.query(sqlHistorial, [clientId], (err2, historial) => {
            if (err2) return res.status(500).send("Error generando reporte");

            const doc = new PDFDocument({ margin: 50 });

            // Configurar Headers para descarga
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=Reporte_Ejecutivo_${cliente.nombre_completo.replace(/ /g, '_')}.pdf`);
            doc.pipe(res);

            // --- A. ENCABEZADO CORPORATIVO ---
            doc.fontSize(20).fillColor('#2563EB').text('NOR-TECH-LY / PV360', { align: 'left' }); // Azul Corporativo
            doc.fontSize(10).fillColor('#64748B').text('Reporte Ejecutivo de Servicios', { align: 'left' });

            // Fecha a la derecha
            doc.fontSize(10).text(new Date().toLocaleString(), 400, 50, { align: 'right' });

            // Línea divisoria
            doc.moveDown(0.5);
            doc.rect(50, 90, 500, 2).fill('#2563EB'); // Barra Azul

            // --- B. PERFIL DEL CLIENTE ---
            doc.moveDown(2);
            doc.rect(50, 110, 500, 70).fill('#F1F5F9'); // Fondo Gris Suave
            doc.fillColor('#0F172A').fontSize(14).text(cliente.nombre_completo, 70, 125, { bold: true });
            doc.fontSize(10).fillColor('#475569');
            doc.text(`ID Cliente: #${cliente.id_cliente}`, 70, 145);
            doc.text(`Email: ${cliente.email || 'No registrado'}`, 250, 145);
            doc.text(`Teléfono: ${cliente.telefono || 'No registrado'}`, 400, 145);

            // --- C. KPI SUMMARY (RESUMEN FINANCIERO) ---
            const totalInvertido = historial.reduce((acc, curr) => acc + Number(curr.total_facturado || 0), 0);
            const vehiculosUnicos = new Set(historial.map(h => h.patente)).size;

            doc.moveDown(4);
            doc.fontSize(12).fillColor('#0F172A').text('RESUMEN EJECUTIVO', 50, 200, { underline: true });

            // Dibujamos 3 Cajas de KPI
            doc.fontSize(10).text('INVERSIÓN TOTAL', 50, 220);
            doc.fontSize(14).text(`$${totalInvertido.toLocaleString('es-AR')}`, 50, 235);

            doc.fontSize(10).text('VEHÍCULOS', 200, 220);
            doc.fontSize(14).text(`${vehiculosUnicos} Unidades`, 200, 235);

            doc.fontSize(10).text('VISITAS HISTÓRICAS', 350, 220);
            doc.fontSize(14).text(`${historial.length} Servicios`, 350, 235);

            // --- D. TABLA DETALLADA ---
            doc.moveDown(4);
            let yPosition = 280;

            // Encabezados de Tabla
            doc.rect(50, yPosition, 500, 20).fill('#1E293B'); // Fondo Negro Tabla
            doc.fillColor('#FFFFFF').fontSize(9);
            doc.text('FECHA', 60, yPosition + 5);
            doc.text('VEHÍCULO / PATENTE', 160, yPosition + 5);
            doc.text('SERVICIO REALIZADO', 300, yPosition + 5);
            doc.text('ESTADO', 460, yPosition + 5, { align: 'right' });

            yPosition += 30;
            doc.fillColor('#334155'); // Color texto filas

            // Filas de datos
            historial.forEach((item, index) => {
                // Verificar si necesitamos nueva página
                if (yPosition > 700) {
                    doc.addPage();
                    yPosition = 50;
                }

                // Fondo alternado para filas
                if (index % 2 === 0) {
                    doc.rect(50, yPosition - 5, 500, 35).fill('#F8FAFC'); // Aumenté un poco la altura del fondo por si acaso
                }

                doc.fillColor('#0F172A').fontSize(9);

                // 1. Fecha
                const fechaFormat = new Date(item.fecha).toLocaleDateString();
                doc.text(fechaFormat, 60, yPosition);

                // 2. Vehículo (CORRECCIÓN DE FORMATO: Aumentar ancho)
                const vehiculoInfo = item.marca ? `${item.marca} ${item.modelo}` : 'Vehículo Genérico';
                // CAMBIO: Se aumentó width de 120 a 135 para evitar superposición en nombres largos
                doc.text(vehiculoInfo, 160, yPosition, { width: 135 });
                doc.fontSize(7).fillColor('#64748B').text(item.patente || 'S/P', 160, yPosition + 10);

                // 3. Servicio (CORRECCIÓN DE DATOS: Decodificar 0 y 1)
                doc.fontSize(9).fillColor('#0F172A');

                let servicioTexto = item.diagnostico_software || 'Sin detalle';

                // Lógica para interpretar los códigos según tu indicación
                if (servicioTexto == '0') {
                    servicioTexto = 'Servicio Mecánico (Sin Req. Software)';
                } else if (servicioTexto == '1') {
                    servicioTexto = 'Servicio con Diagnóstico de Software';
                }
                // Si no es 0 ni 1, muestra el texto original (ej: "Cambio de Pastillas")

                doc.text(servicioTexto, 300, yPosition, { width: 150 });

                // 4. Monto y Estado
                doc.text(`$${Number(item.total_facturado).toLocaleString('es-AR')}`, 460, yPosition, { align: 'right' });

                const estadoTexto = item.estado_pago || 'Pendiente';
                doc.fontSize(7).fillColor(estadoTexto === 'Pagado' ? '#10B981' : '#F59E0B');
                doc.text(estadoTexto.toUpperCase(), 460, yPosition + 10, { align: 'right' });

                yPosition += 35; // Espacio para la siguiente fila
            });

            // --- E. PIE DE PÁGINA ---
            doc.fontSize(8).fillColor('#94a3b8').text('Generado automáticamente por Sistema PV360 PRO', 50, 750, { align: 'center' });

            doc.end();
        });
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Puerto ${PORT}`));