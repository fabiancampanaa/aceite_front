import axios from "axios";
import React, { useEffect, useState } from "react";

function Dashboard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/v1/busquedas/") // Reemplaza con tu endpoint real
      .then((response) => {
        setData(response.data); // Guarda la respuesta en el estado
        setLoading(false);
      })
      .catch((error) => {
        setError("Error fetching data");
        setLoading(false);
      });
  }, []); // Se ejecuta solo una vez al montar el componente

  return (
    <div className="container">
      <h1 className="title">Dashboard</h1>
      {loading && <p>Loading...</p>}
      {error && <p className="has-text-danger">{error}</p>}
      <ul>
        {data.map((item) => (
          <li key={item.id}>
            {item.producto} - {item.marca}
          </li> // Ajusta según la estructura de tu API
        ))}
      </ul>
    </div>
  );
}

export default Dashboard;
