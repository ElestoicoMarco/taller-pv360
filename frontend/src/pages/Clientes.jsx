import React, { useState, useEffect } from 'react';
import axios from 'axios';

// URL DE TU SERVIDOR
const API_URL = 'https://taller-pv360-c69q.onrender.com/api/clientes';

const Clientes = () => {
  const [clientes, setClientes] = useState([]);

  // CARGAR DATOS
  useEffect(() => {
    axios.get(API_URL)
      .then(res => {
        console.log("Datos recibidos:", res.data); // MIRA LA CONSOLA
        setClientes(Array.isArray(res.data) ? res.data : []);
      })
      .catch(err => alert("Error cargando: " + err.message));
  }, []);

  // ELIMINAR DIRECTO
  const probarEliminar = (id) => {
    alert("CLICK DETECTADO EN ID: " + id); // SI ESTO NO SALE, TU MOUSE NO LLEGA AL BOTON
    
    if(!id) return alert("EL ID ES NULL O UNDEFINED");

    axios.delete(`${API_URL}/${id}`)
      .then(() => {
        alert("¡BORRADO EXITOSO!");
        window.location.reload();
      })
      .catch(err => alert("ERROR DEL SERVIDOR: " + err.message));
  };

  return (
    <div style={{ padding: '50px', backgroundColor: 'white', color: 'black' }}>
      <h1>MODO DIAGNÓSTICO (FE0)</h1>
      <p>Si estos botones funcionan, el problema era el diseño anterior.</p>
      
      <ul>
        {clientes.map((cli) => (
          <li key={cli.id_cliente || Math.random()} style={{ borderBottom: '1px solid #ccc', padding: '10px' }}>
            <strong>NOMBRE:</strong> {cli.nombre_completo} <br/>
            <strong>ID (DB):</strong> {cli.id_cliente} <br/>
            
            {/* BOTÓN HTML PURO SIN ESTILOS RAROS */}
            <button 
              onClick={() => probarEliminar(cli.id_cliente)}
              style={{ backgroundColor: 'red', color: 'white', padding: '10px', cursor: 'pointer', fontSize: '16px' }}
            >
              ELIMINAR AL #{cli.id_cliente}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Clientes;