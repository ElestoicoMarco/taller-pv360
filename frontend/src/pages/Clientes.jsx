import React, { useState, useEffect } from 'react';
import axios from 'axios';

// ⚠️ NO IMPORTAMOS MAINLAYOUT NI ICONOS PARA EVITAR BLOQUEOS VISUALES
// USAMOS ESTILOS NATIVOS PARA ASEGURAR QUE EL CLICK LLEGUE

const API_URL = 'https://taller-pv360-c69q.onrender.com/api/clientes';

const Clientes = () => {
  const [clientes, setClientes] = useState([]);
  const [error, setError] = useState('');

  // 1. CARGAR DATOS
  useEffect(() => {
    cargarClientes();
  }, []);

  const cargarClientes = async () => {
    try {
      const res = await axios.get(API_URL);
      console.log("Datos:", res.data);
      setClientes(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      alert("Error cargando: " + err.message);
    }
  };

  // 2. ELIMINAR (DIRECTO Y SIN ESTILOS RAROS)
  const eliminarAhora = async (id) => {
    // ESTA ALERTA DEBE SALIR SI O SI
    alert(`¡CLICK RECIBIDO! Intentando borrar ID: ${id}`);

    try {
      await axios.delete(`${API_URL}/${id}`);
      alert("✅ SERVIDOR RESPONDIÓ: Eliminado correctamente");
      cargarClientes();
    } catch (err) {
      alert("❌ ERROR DEL SERVIDOR: " + err.message);
      console.error(err);
    }
  };

  return (
    <div style={{ padding: '20px', backgroundColor: 'white', color: 'black', height: '100vh', overflow: 'auto' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>
        PANEL DE CONTROL DE EMERGENCIA
      </h1>
      
      <p style={{ marginBottom: '20px', color: 'red' }}>
        Si estos botones funcionan, el problema era que tu diseño anterior tapaba los clicks.
      </p>

      <button 
        onClick={cargarClientes}
        style={{ padding: '10px 20px', backgroundColor: 'blue', color: 'white', marginBottom: '20px', cursor: 'pointer' }}
      >
        RECARGAR DATOS MANUALMENTE
      </button>

      <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#eee' }}>
            <th>ID</th>
            <th>NOMBRE</th>
            <th>EMAIL</th>
            <th>ACCIÓN DE BORRADO</th>
          </tr>
        </thead>
        <tbody>
          {clientes.map((cli) => (
            <tr key={cli.id_cliente}>
              <td>{cli.id_cliente}</td>
              <td>{cli.nombre_completo}</td>
              <td>{cli.email}</td>
              <td style={{ textAlign: 'center' }}>
                {/* BOTÓN HTML PURO - IMPOSIBLE DE BLOQUEAR */}
                <button
                  onClick={() => eliminarAhora(cli.id_cliente)}
                  style={{
                    backgroundColor: 'red',
                    color: 'white',
                    padding: '10px 20px',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    zIndex: 9999, // FORZAMOS QUE ESTÉ ENCIMA DE TODO
                    position: 'relative'
                  }}
                >
                  ELIMINAR AL #{cli.id_cliente}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Clientes;