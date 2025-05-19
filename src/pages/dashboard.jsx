import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import GraficoPorMarketplace from "../components/grafico_cant_marca";
import GraficoPreciosMensuales from "../components/grafico_evolucion_precios";
import GraficoComparacionPorMarketplace from "../components/grafico_comp_market";
import GraficoPrecioAceitePorMarketplaceExclusivo from "../components/grafico_comp_market_exclusivo";
import GraficoPreciosMensualesExclusivo from "../components/grafico_evolucion_precios_exclusivo";
import ListaBusquedasRRSS from "../components/grafico_rrss1";
import GraficoPrecioAceitePorMarca from "../components/grafico_comp_marca";
import ListaBusquedasRRSSMarca from "../components/grafico_rrss2";
import ListaBusquedasRRSSEvolucion from "../components/grafico_rrss_evolucion_seguidores";
import "../css/dashboard.css";

function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [usuario, setUsuario] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        "http://127.0.0.1:8000/api/v1/busquedas/"
      );
      setData(response.data);
      setLastUpdated(new Date());
    } catch (error) {
      if (error.response && error.response.status === 401) {
        localStorage.removeItem("authToken");
        navigate("/");
      } else {
        setError(
          "No se pudieron cargar los datos. Por favor intenta nuevamente."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/");
      return;
    }
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUsuario(JSON.parse(storedUser));
    }

    axios.defaults.headers.common["Authorization"] = `Token ${token}`;
    fetchData();

    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [navigate]);

  const TituloConIcono = ({ icono, texto }) => (
    <h2 className="title is-5 has-text-white mb-4">
      <span className="icon-text">
        <span className="icon has-text-info">
          <i className={`fas ${icono}`}></i>
        </span>
        <span>{texto}</span>
      </span>
    </h2>
  );

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
        <div className="fixed-grid has-1-cols">
          {/* Gráfico: Distribución por Marketplace */}
          <div className="column is-12-desktop is-12-mobile">
            <div className="box">
              <TituloConIcono
                icono="fa-store"
                texto="Distribución por Marketplace"
              />
              <GraficoPorMarketplace data={data} />
            </div>
          </div>

          {/* Comparación por Marketplace */}
          {(usuario?.tipo_acceso === "General" ||
            usuario?.tipo_acceso === "Exclusivo") && (
            <div className="column is-12-desktop is-12-mobile">
              <div className="box">
                <TituloConIcono
                  icono={
                    usuario.tipo_acceso === "Exclusivo"
                      ? "fa-lock"
                      : "fa-balance-scale-right"
                  }
                  texto={
                    usuario.tipo_acceso === "Exclusivo"
                      ? "Comparación entre Marketplaces (Con filtro de Marca)"
                      : "Comparación entre Marketplaces"
                  }
                />
                {usuario.tipo_acceso === "General" ? (
                  <GraficoComparacionPorMarketplace data={data} />
                ) : (
                  <div className="fixed-grid has-1-cols">
                    <div className="column is-12 p-4">
                      <div className="box">
                        <GraficoPrecioAceitePorMarketplaceExclusivo
                          data={data}
                        />
                      </div>
                    </div>
                    <div className="column is-12">
                      <div className="box">
                        <GraficoPrecioAceitePorMarca data={data} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Evolución de precios */}
          {(usuario?.tipo_acceso === "General" ||
            usuario?.tipo_acceso === "Exclusivo") && (
            <div className="column is-12">
              <div className="box">
                <TituloConIcono
                  icono={
                    usuario.tipo_acceso === "Exclusivo"
                      ? "fa-lock"
                      : "fa-chart-line"
                  }
                  texto={
                    usuario.tipo_acceso === "Exclusivo"
                      ? "Evolución de Precios Mensuales (con filtro de Marca)"
                      : "Evolución de Precios Mensuales"
                  }
                />
                {usuario.tipo_acceso === "General" ? (
                  <GraficoPreciosMensualesExclusivo
                    data={data}
                    showMarca={false}
                  />
                ) : (
                  <GraficoPreciosMensualesExclusivo
                    data={data}
                    showMarca={true}
                  />
                )}
              </div>
            </div>
          )}

          {/* RRSS */}
          <div className="column is-12">
            <div className="box">
              <TituloConIcono
                icono="fa-hashtag"
                texto="Tendencias en Redes Sociales"
              />

              {usuario.tipo_acceso === "General" ? (
                <ListaBusquedasRRSS data={data} />
              ) : (
                <div className="fixed-grid has-1-cols">
                  <div className="column is-12 p-4">
                    <div className="box">
                      <ListaBusquedasRRSS data={data} />
                    </div>
                  </div>
                  <div className="column is-12 p-4">
                    <div className="box">
                      <ListaBusquedasRRSSMarca data={data} />
                    </div>
                  </div>
                  <div className="column is-12 p-4">
                    <div className="box">
                      <ListaBusquedasRRSSEvolucion data={data} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <footer className="column is-12 mt-6 has-text-centered">
            <p className="is-size-7 has-text-grey-light">Aceite del Huasco</p>
          </footer>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
