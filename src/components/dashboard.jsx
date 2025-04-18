import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import GraficoPorMarketplace from "./grafico_cant_marca";
import GraficoPreciosMensuales from "./grafico_evolucion_precios";
import GraficoComparacionPorMarketplace from "./grafico_comp_market";
import ListaBusquedasRRSS from "./grafico_rrss1";

function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [dataChart, setDataChart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Verificar si existe el token en localStorage
    const token = localStorage.getItem("authToken");

    if (!token) {
      // Si no hay token, redirigir al login
      navigate("/");
      return;
    }

    // Configurar los headers de axios con el token
    axios.defaults.headers.common["Authorization"] = `Token ${token}`;

    axios
      .get("http://127.0.0.1:8000/api/v1/busquedas/")
      .then((response) => {
        setData(response.data);
        setLoading(false);
      })
      .catch((error) => {
        if (error.response && error.response.status === 401) {
          // Token inválido o expirado
          localStorage.removeItem("authToken");
          navigate("/");
        } else {
          setError("Error fetching data");
        }
        setLoading(false);
      });
  }, [navigate]);

  const cerrarSesion = () => {
    // Opcional: Puedes hacer una llamada al backend para invalidar el token
    localStorage.removeItem("authToken");
    navigate("/");
  };

  return (
    <div className="container is-fullhd has-background-white p-3">
      <div className="level">
        <div className="level-left">
          <h1 className="title has-text-primary">Dashboard</h1>
        </div>
        <div className="level-right">
          <button className="button is-danger is-light" onClick={cerrarSesion}>
            Cerrar Sesión
          </button>
        </div>
      </div>

      {loading && (
        <div className="has-text-centered">
          <progress className="progress is-small is-primary" max="100">
            Cargando...
          </progress>
          <p>Cargando datos...</p>
        </div>
      )}

      {error && (
        <div className="notification is-danger is-light">
          <button className="delete" onClick={() => setError(null)}></button>
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="fixed-grid has-1-cols">
          <div className="grid">
            <div className="cell">
              <GraficoPorMarketplace data={data} />
            </div>
            <div className="cell">
              <GraficoComparacionPorMarketplace data={data} />
            </div>
            <div className="cell">
              <GraficoPreciosMensuales data={data} />
            </div>
            <div className="cell">
              <ListaBusquedasRRSS data={data} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
