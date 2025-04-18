import React, { useState, useEffect } from "react";
import { getAllBusquedasrrss } from "../api/busquedas.api";

const ListaBusquedasRRSS = () => {
  const [busquedas, setBusquedas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const obtenerBusquedas = async () => {
      try {
        const respuesta = await getAllBusquedasrrss();
        setBusquedas(respuesta.data); // Asumiendo que los datos vienen en respuesta.data
        setCargando(false);
      } catch (err) {
        setError(err.message);
        setCargando(false);
      }
    };

    obtenerBusquedas();
  }, []);

  if (cargando) {
    return <div>Cargando datos...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h2>Búsquedas en Redes Sociales</h2>
      {busquedas.length > 0 ? (
        <ul>
          {busquedas.map((busqueda) => (
            <li key={busqueda.id}>
              {/* Ajusta estos campos según la estructura real de tus datos */}
              <p>rss: {busqueda.rrss}</p>
              <p>marca: {busqueda.marca || "No disponible"}</p>
              {/* Agrega más campos según necesites */}
            </li>
          ))}
        </ul>
      ) : (
        <p>No hay búsquedas disponibles</p>
      )}
    </div>
  );
};

export default ListaBusquedasRRSS;
