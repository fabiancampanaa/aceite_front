import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import GraficoPorMarketplace from "./grafico_cant_marca";
import GraficoPreciosMensuales from "./grafico_evolucion_precios";
import GraficoComparacionPorMarketplace from "./grafico_comp_market";
import ListaBusquedasRRSS from "./grafico_rrss1";
import "../css/dashboard.css";

function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchData = () => {
    setLoading(true);
    setError(null);

    axios
      .get("http://127.0.0.1:8000/api/v1/busquedas/")
      .then((response) => {
        setData(response.data);
        setLastUpdated(new Date());
      })
      .catch((error) => {
        if (error.response && error.response.status === 401) {
          localStorage.removeItem("authToken");
          navigate("/");
        } else {
          setError(
            "No se pudieron cargar los datos. Por favor intenta nuevamente."
          );
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const user = localStorage.getItem("user");
    if (!token || user.tipo_acceso != "basico") {
      navigate("/");
      return;
    }

    axios.defaults.headers.common["Authorization"] = `Token ${token}`;
    fetchData();

    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [navigate]);

  const cerrarSesion = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="section p-4" style={{ minHeight: "100vh" }}>
      {/* Header */}
      <div className="level is-mobile">
        <div className="level-left">
          <div>
            <h1 className="title has-text-white is-size-4-mobile">
              Dashboard de Mercado
            </h1>
            <p className="subtitle is-6 has-text-grey-light">
              Análisis en tiempo real de productos y precios
            </p>
          </div>
        </div>
        <div className="level-right">
          <div className="buttons has-addons">
            <button
              className="button is-info is-light is-small-mobile"
              onClick={fetchData}
              disabled={loading}
              aria-label="Actualizar datos"
            >
              <span className="icon">
                <i className="fas fa-sync-alt"></i>
              </span>
              <span className="is-hidden-mobile">Actualizar</span>
            </button>
            <button
              className="button is-danger is-light is-small-mobile"
              onClick={cerrarSesion}
              aria-label="Cerrar sesión"
            >
              <span className="icon">
                <i className="fas fa-sign-out-alt"></i>
              </span>
              <span className="is-hidden-mobile">Salir</span>
            </button>
          </div>
        </div>
      </div>

      {!loading && !error && (
        <div className="mb-4 has-text-right">
          <span className="tag is-light is-rounded">
            <i className="fas fa-clock mr-2"></i>
            {lastUpdated
              ? `Actualizado: ${lastUpdated.toLocaleTimeString()}`
              : "Cargando..."}
          </span>
        </div>
      )}

      {error && (
        <div className="notification is-danger is-light">
          <button
            className="delete"
            onClick={() => setError(null)}
            aria-label="Cerrar notificación de error"
          ></button>
          <div className="is-flex is-align-items-center">
            <span className="icon mr-2">
              <i className="fas fa-exclamation-triangle"></i>
            </span>
            <div>
              <p className="has-text-weight-semibold">
                ¡Error al cargar los datos!
              </p>
              <p className="is-size-7">{error}</p>
            </div>
          </div>
          <div className="buttons is-right mt-3">
            <button
              className="button is-danger is-small is-outlined"
              onClick={() => navigate("/")}
            >
              Volver al inicio
            </button>
            <button className="button is-link is-small" onClick={fetchData}>
              Reintentar
            </button>
          </div>
        </div>
      )}

      {loading && !error && (
        <div className="columns is-multiline">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className={`column ${item > 2 ? "is-full" : "is-half"}`}
            >
              <div
                className="skeleton-box"
                style={{
                  height: item > 2 ? "400px" : "350px",
                  width: "100%",
                  background: "#f5f5f5",
                  borderRadius: "6px",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  className="shimmer-wrapper"
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    animation: "shimmer 1.5s infinite",
                    background:
                      "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,0) 100%)",
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && !error && (
        <div className="columns is-multiline">
          {/* Sidebar (optional, could be hidden on mobile) */}
          <aside className="column is-2 is-hidden-mobile">
            <div className="menu">
              <p className="menu-label">Secciones</p>
              <ul className="menu-list">
                <li>
                  <a href="#mercado">📊 Análisis de Mercado</a>
                </li>
                <li>
                  <a href="#rrss">🌐 Redes Sociales</a>
                </li>
              </ul>
            </div>
          </aside>

          {/* Main content */}
          <div className="column is-10">
            <div id="mercado" className="columns is-multiline">
              <div className="column is-6">
                <div className="box">
                  <h2 className="title is-5 has-text-white mb-4">
                    <span className="icon-text">
                      <span className="icon has-text-info">
                        <i className="fas fa-store"></i>
                      </span>
                      <span>Distribución por Marketplace</span>
                    </span>
                  </h2>
                  <GraficoPorMarketplace data={data} />
                </div>
              </div>

              <div className="column is-6">
                <div className="box">
                  <h2 className="title is-5 has-text-white mb-4">
                    <span className="icon-text">
                      <span className="icon has-text-info">
                        <i className="fas fa-balance-scale-right"></i>
                      </span>
                      <span>Comparación entre Marketplaces</span>
                    </span>
                  </h2>
                  <GraficoComparacionPorMarketplace data={data} />
                </div>
              </div>

              <div className="column is-12">
                <div className="box">
                  <h2 className="title is-5 has-text-white mb-4">
                    <span className="icon-text">
                      <span className="icon has-text-info">
                        <i className="fas fa-chart-line"></i>
                      </span>
                      <span>Evolución de Precios Mensuales</span>
                    </span>
                  </h2>
                  <GraficoPreciosMensuales data={data} />
                </div>
              </div>
            </div>

            <div id="rrss" className="column is-full mt-5">
              <div className="box">
                <h2 className="title is-5 has-text-white mb-4">
                  <span className="icon-text">
                    <span className="icon has-text-info">
                      <i className="fas fa-hashtag"></i>
                    </span>
                    <span>Tendencias en Redes Sociales</span>
                  </span>
                </h2>
                <ListaBusquedasRRSS data={data} />
              </div>
            </div>

            <footer className="mt-6 has-text-centered">
              <p className="is-size-7 has-text-grey-light">Aceite del Huasco</p>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
