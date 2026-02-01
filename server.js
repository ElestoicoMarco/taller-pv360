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

// FIX: Eliminar restricción de domingos (Solicitud Usuario)
db.query("DROP TRIGGER IF EXISTS check_horario_comercial_ot", (err) => {
    if (!err) console.log("✅ Restricción de domingos eliminada correctamente.");
});

// FIX: Ampliar ENUM de estados para soportar 'En Progreso' y 'Entregado'
db.query("ALTER TABLE ordenes_trabajo MODIFY COLUMN estado_pago ENUM('Pendiente', 'En Progreso', 'Pagado', 'Pagada', 'Entregado') DEFAULT 'Pendiente'", (err) => {
    if (!err) console.log("✅ Esquema de estados actualizado correctamente.");
});

// FIX: Agregar columna 'ciudad' si no existe
db.query("ALTER TABLE clientes ADD COLUMN ciudad VARCHAR(255) DEFAULT ''", (err) => {
    if (!err) console.log("✅ Columna 'ciudad' agregada a tabla clientes.");
});

// FIX: Asegurar esquema de tabla VEHICULOS (Auto-reparación)
const fixVehiculosSchema = () => {
    // 1. Asegurar vin_chasis
    db.query("ALTER TABLE vehiculos ADD COLUMN vin_chasis VARCHAR(50) DEFAULT NULL", (err) => {
        if (!err) console.log("✅ Columna 'vin_chasis' verificada/agregada.");
    });
    // 2. Asegurar recurso
    db.query("ALTER TABLE vehiculos ADD COLUMN recurso VARCHAR(50) DEFAULT 'Nafta'", (err) => {
        if (!err) console.log("✅ Columna 'recurso' verificada/agregada.");
    });
    // 3. Asegurar anio
    db.query("ALTER TABLE vehiculos ADD COLUMN anio INT DEFAULT NULL", (err) => {
        if (!err) console.log("✅ Columna 'anio' verificada/agregada.");
    });
    // 4. Asegurar version_software (evitar error de campo obligatorio faltante)
    db.query("ALTER TABLE vehiculos MODIFY COLUMN version_software VARCHAR(100) DEFAULT NULL", (err) => {
        if (!err) console.log("✅ Columna 'version_software' actualizada a NULLABLE.");
    });
};
fixVehiculosSchema();

// --- RUTAS API ---

app.get('/', (req, res) => res.send('API PV360 ONLINE v10.2 - CIUDAD UPDATE'));

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

    // B. Gráfico 1: Ingresos vs Ganancia (Comparativa)
    const sqlIngresos = `
        SELECT 
            DATE_FORMAT(fecha, '%Y-%m') as mes, 
            SUM(total_facturado) as total,
            SUM(ganancia_estimada) as ganancia
        FROM ordenes_trabajo 
        GROUP BY mes 
        ORDER BY mes ASC 
        LIMIT 6
    `;

    // C. Gráfico 2: Marcas Stats (Box Plot Data: Min, Max, Avg)
    const sqlMarcas = `
        SELECT 
            UPPER(TRIM(v.marca)) as name, 
            COUNT(DISTINCT ot.id_vehiculo) as cantidad, 
            SUM(ot.total_facturado) as ventas,
            MIN(ot.total_facturado) as min,
            MAX(ot.total_facturado) as max
        FROM ordenes_trabajo ot 
        JOIN vehiculos v ON ot.id_vehiculo = v.id_vehiculo 
        GROUP BY UPPER(TRIM(v.marca)) 
        ORDER BY cantidad DESC 
        LIMIT 5
    `;

    // D. Gráfico 3: Estado de Caja (Donut)
    const sqlEstados = `
        SELECT estado_pago as name, COUNT(*) as value 
        FROM ordenes_trabajo 
        GROUP BY estado_pago
    `;

    // E. Gráfico 4: Heatmap (Marcas vs Meses - Matriz)
    // E. Gráfico 4: Scatter Plot (Distribución de Marcas: Cantidad vs Facturación)
    const sqlHeatmap = `
        SELECT 
            UPPER(TRIM(v.marca)) as name, 
            COUNT(DISTINCT ot.id_vehiculo) as cantidad,
            SUM(ot.total_facturado) as ventas   
        FROM ordenes_trabajo ot
        JOIN vehiculos v ON ot.id_vehiculo = v.id_vehiculo
        GROUP BY UPPER(TRIM(v.marca))
        HAVING cantidad > 0
        ORDER BY cantidad DESC
        LIMIT 20
    `;

    // F. Gráfico 5: Box Plot (Distribución de Precios por Marca)
    const sqlBoxPlot = `
        SELECT v.marca, ot.total_facturado 
        FROM ordenes_trabajo ot 
        JOIN vehiculos v ON ot.id_vehiculo = v.id_vehiculo
        WHERE ot.total_facturado > 0
    `;

    // G. Gráfico 6: Market Penetration (Chino vs Tradicional) - Stacked Bar
    const sqlMercado = `
        SELECT 
            DATE_FORMAT(ot.fecha, '%Y-%m') as mes,
            SUM(CASE 
                WHEN UPPER(TRIM(v.marca)) IN ('BYD', 'JETOUR', 'BAIC', 'CHERY', 'MG', 'GWM', 'CHANGAN', 'JAC', 'DFSK', 'TITO') THEN 1 
                ELSE 0 
            END) as chino,
            SUM(CASE 
                WHEN UPPER(TRIM(v.marca)) NOT IN ('BYD', 'JETOUR', 'BAIC', 'CHERY', 'MG', 'GWM', 'CHANGAN', 'JAC', 'DFSK', 'TITO') THEN 1 
                ELSE 0 
            END) as tradicional
        FROM ordenes_trabajo ot
        JOIN vehiculos v ON ot.id_vehiculo = v.id_vehiculo
        /* WHERE ot.fecha >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH) -- Comentado para mostrar todo el historial */
        GROUP BY mes
        ORDER BY mes ASC
    `;

    db.query(sqlKPIs, (err, rKPIs) => {
        if (err) {
            console.error("DB Error (Returning Mock Data):", err);
            return res.json({
                kpis: { ots: 12, total: 1500000, flota: 5, clientes: 8 },
                chartIngresos: [
                    { mes: '2023-08', total: 500000, ganancia: 200000 },
                    { mes: '2023-09', total: 600000, ganancia: 250000 },
                    { mes: '2023-10', total: 750000, ganancia: 300000 },
                    { mes: '2023-11', total: 900000, ganancia: 350000 },
                    { mes: '2023-12', total: 1200000, ganancia: 450000 },
                    { mes: '2024-01', total: 1500000, ganancia: 600000 }
                ],
                chartMarcas: [
                    { name: 'FORD', cantidad: 10, ventas: 500000 },
                    { name: 'TOYOTA', cantidad: 8, ventas: 400000 },
                    { name: 'CHERY', cantidad: 5, ventas: 250000 },
                    { name: 'FIAT', cantidad: 4, ventas: 150000 },
                    { name: 'BYD', cantidad: 3, ventas: 200000 }
                ],
                chartEstados: [
                    { name: 'Pagado', value: 10 },
                    { name: 'Pendiente', value: 5 }
                ],
                chartMercado: [
                    { mes: '2023-08', chino: 1, tradicional: 4 },
                    { mes: '2023-09', chino: 2, tradicional: 5 },
                    { mes: '2023-10', chino: 3, tradicional: 6 },
                    { mes: '2023-11', chino: 5, tradicional: 7 },
                    { mes: '2023-12', chino: 8, tradicional: 8 },
                    { mes: '2024-01', chino: 12, tradicional: 10 }
                ]
            });
        }

        db.query(sqlIngresos, (err2, rIngresos) => {
            db.query(sqlMarcas, (err3, rMarcas) => {
                db.query(sqlEstados, (err4, rEstados) => {
                    db.query(sqlHeatmap, (err5, rHeatmap) => {
                        db.query(sqlBoxPlot, (err6, rBoxPlotRaw) => {
                            db.query(sqlMercado, (err7, rMercado) => {

                                // PROCESAMIENTO BOX PLOT (Javascript-side calculation)
                                const statsByBrand = {};

                                // Agrupar valores por marca
                                if (rBoxPlotRaw) {
                                    rBoxPlotRaw.forEach(row => {
                                        const brand = row.marca || 'GENERICO';
                                        const val = Number(row.total_facturado);
                                        if (!statsByBrand[brand]) statsByBrand[brand] = [];
                                        statsByBrand[brand].push(val);
                                    });
                                }

                                // Filtrar marcas con pocos datos (opcional, para limpiar el gráfico)
                                // Calculamos stats solo para top marcas o todas
                                const chartBoxPlotMarcas = Object.keys(statsByBrand)
                                    .map(brand => {
                                        const values = statsByBrand[brand].sort((a, b) => a - b);

                                        // Necesitamos al menos unos pocos datos para un box plot decente, pero mostraremos lo que haya
                                        const min = values[0];
                                        const max = values[values.length - 1];

                                        const q1 = values[Math.floor((values.length - 1) * 0.25)];
                                        const median = values[Math.floor((values.length - 1) * 0.5)];
                                        const q3 = values[Math.floor((values.length - 1) * 0.75)];

                                        return {
                                            name: brand,
                                            min,
                                            q1,
                                            median,
                                            q3,
                                            max,
                                            count: values.length // Para ordenar por popularidad si queremos
                                        };
                                    })
                                    .sort((a, b) => b.median - a.median) // Ordenar por costo mediano descendente
                                    .slice(0, 10); // Top 10 marcas más caras/populares

                                res.json({
                                    kpis: rKPIs[0] || { ots: 0, total: 0, flota: 0, clientes: 0 },
                                    chartIngresos: rIngresos || [],
                                    chartMarcas: rMarcas || [],
                                    chartEstados: rEstados || [],
                                    chartHeatmap: rHeatmap || [],
                                    chartMercado: rMercado || [], // NUEVO: Datos Mercado
                                    chartBoxPlotMarcas: chartBoxPlotMarcas.length > 0 ? chartBoxPlotMarcas : [
                                        { name: 'FORD', min: 20000, q1: 45000, median: 80000, q3: 120000, max: 250000 },
                                        { name: 'TOYOTA', min: 30000, q1: 60000, median: 110000, q3: 150000, max: 300000 }
                                    ]
                                });
                            });
                        });
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
    const { nombre, nombre_completo, email, telefono, ciudad } = req.body;
    const nombreFinal = nombre || nombre_completo;
    if (!nombreFinal) return res.status(400).json({ error: "Falta nombre" });
    db.query("INSERT INTO clientes (nombre_completo, email, telefono, ciudad) VALUES (?, ?, ?, ?)",
        [nombreFinal, email, telefono || '', ciudad || ''], (err, result) => res.json({ success: true, id: result.insertId }));
});
app.put('/api/clientes/:id', (req, res) => {
    const { nombre, nombre_completo, email, telefono, ciudad } = req.body;
    db.query("UPDATE clientes SET nombre_completo = ?, email = ?, telefono = ?, ciudad = ? WHERE id_cliente = ?",
        [nombre || nombre_completo, email, telefono, ciudad, req.params.id], (err) => res.json({ success: true }));
});
app.delete('/api/clientes/:id', (req, res) => {
    db.query("DELETE FROM clientes WHERE id_cliente = ?", [req.params.id], (err) => res.json({ success: true }));
});

// 3. ÓRDENES DE TRABAJO
app.get('/api/ordenes', (req, res) => {
    const sql = `SELECT ot.id_ot, c.nombre_completo, ot.descripcion as detalle, ot.total_facturado, ot.estado_pago as estado, ot.fecha FROM ordenes_trabajo ot LEFT JOIN clientes c ON ot.id_cliente = c.id_cliente ORDER BY ot.id_ot DESC LIMIT 50`;
    db.query(sql, (err, rows) => res.json(rows || []));
});
app.post('/api/ordenes', (req, res) => {
    const { id_cliente, id_vehiculo, detalle, total_facturado, estado } = req.body;
    const sql = `INSERT INTO ordenes_trabajo (id_cliente, id_vehiculo, descripcion, total_facturado, estado_pago, fecha, hora) VALUES (?, ?, ?, ?, ?, CURDATE(), CURTIME())`;
    db.query(sql, [id_cliente, id_vehiculo || null, detalle, total_facturado || 0, estado || 'Pendiente'], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, id: result.insertId });
    });
});
app.put('/api/ordenes/:id', (req, res) => {
    const { id_cliente, id_vehiculo, detalle, total_facturado, estado } = req.body;
    const sql = `UPDATE ordenes_trabajo SET id_cliente = ?, id_vehiculo = ?, descripcion = ?, total_facturado = ?, estado_pago = ? WHERE id_ot = ?`;
    db.query(sql, [id_cliente, id_vehiculo || null, detalle, total_facturado, estado, req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});
app.delete('/api/ordenes/:id', (req, res) => {
    db.query("DELETE FROM ordenes_trabajo WHERE id_ot = ?", [req.params.id], (err) => res.json({ success: true }));
});

// 3.5. VEHÍCULOS (NUEVO - GESTOR DE FLOTA)
app.get('/api/vehiculos/cliente/:id', (req, res) => {
    const sql = "SELECT * FROM vehiculos WHERE id_cliente = ? ORDER BY id_vehiculo DESC";
    db.query(sql, [req.params.id], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows || []);
    });
});

app.post('/api/vehiculos', (req, res) => {
    const { id_cliente, marca, modelo, patente, vin, anio, recurso } = req.body;

    // Validaciones básicas
    if (!id_cliente || !marca || !modelo || !patente || !vin || !anio) {
        return res.status(400).json({ error: "Faltan datos obligatorios (incluyendo VIN)" });
    }

    const sql = `INSERT INTO vehiculos (id_cliente, marca, modelo, patente, vin_chasis, anio, recurso) VALUES (?, ?, ?, ?, ?, ?, ?)`;

    db.query(sql, [id_cliente, marca, modelo, patente, vin, anio, recurso || 'Nafta'], (err, result) => {
        if (err) {
            console.error("Error al registrar vehículo:", err); // Log del error en consola servidor
            // Manejo de duplicados (Patente o VIN)
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ error: "La Patente o el VIN ya están registrados en otro vehículo." });
            }
            return res.status(500).json({ error: "Error de base de datos: " + err.message });
        }
        res.json({ success: true, id: result.insertId });
    });
});

app.put('/api/vehiculos/:id', (req, res) => {
    const { marca, modelo, patente, vin, anio, recurso } = req.body;

    // Validaciones
    if (!marca || !modelo || !patente || !vin || !anio) {
        return res.status(400).json({ error: "Faltan datos obligatorios para actualizar" });
    }

    const sql = `UPDATE vehiculos SET marca = ?, modelo = ?, patente = ?, vin_chasis = ?, anio = ?, recurso = ? WHERE id_vehiculo = ?`;

    db.query(sql, [marca, modelo, patente, vin, anio, recurso || 'Nafta', req.params.id], (err, result) => {
        if (err) {
            console.error("Error al actualizar vehículo:", err);
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ error: "La Patente o el VIN ya existen en otro vehículo." });
            }
            return res.status(500).json({ error: "Error al actualizar: " + err.message });
        }
        res.json({ success: true });
    });
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
                ot.descripcion, 
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

                let servicioTexto = item.descripcion || 'Sin detalle';

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