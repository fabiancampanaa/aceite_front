import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import GraficoPreciosHistorico from "./grafico2";
import GraficoPorMarketplace from "./grafico3";
import GraficoPreciosMensuales from "./grafico4";
import GraficoComparacionPorMarketplace from "./grafico5";

function Dashboard() {
  let navigate = useNavigate();
  const [data, setData] = useState([]);
  const [dataChart, setDataChart] = useState([]);
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

  const cerrarSesion = async (e) => {
    navigate("/");
  };

  return (
    <div className=".container.is-fullhd has-background-white p-3">
      <h1 className="title has-text-primary">Dashboard</h1>
      <button class="button is-danger is-light" onClick={() => cerrarSesion()}>
        Cerrar Sesión
      </button>
      {loading && <p>Loading...</p>}
      {error && <p className="has-text-danger">{error}</p>}
      <div class="fixed-grid has-2-cols">
        <div class="cell m1">
          <GraficoPorMarketplace />
        </div>
        <div class="cell m1">
          <GraficoComparacionPorMarketplace />
        </div>
        <div class="cell m1">
          <GraficoPreciosMensuales />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
