import React, { useState, useEffect } from "react";
import { getAllBusquedasrrss } from "../api/busquedas.api";
import ReactECharts from "echarts-for-react";

const ListaBusquedasRRSS = () => {
  const [busquedas, setBusquedas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const obtenerBusquedas = async () => {
      try {
        const respuesta = await getAllBusquedasrrss();
        setBusquedas(respuesta.data);
        setCargando(false);
      } catch (err) {
        setError(err.message);
        setCargando(false);
      }
    };
    obtenerBusquedas();
  }, []);

  // Configuración gráfico de barras: Seguidores por Marca
  const getOptionSeguidores = () => {
    const marcas = [...new Set(busquedas.map((item) => item.marca))];
    const datos = marcas.map((marca) => {
      const total = busquedas
        .filter((item) => item.marca === marca)
        .reduce((sum, item) => sum + Number(item.seguidores || 0), 0);
      return total;
    });

    return {
      title: { text: "Seguidores por Marca" },
      tooltip: {},
      xAxis: { data: marcas },
      yAxis: {},
      series: [
        {
          name: "Seguidores",
          type: "bar",
          data: datos,
        },
      ],
    };
  };

  // Configuración gráfico circular: Distribución de Redes Sociales
  const getOptionRedesSociales = () => {
    const conteo = busquedas.reduce((acc, item) => {
      acc[item.rrss] = (acc[item.rrss] || 0) + 1;
      return acc;
    }, {});

    return {
      title: { text: "Distribución por Red Social" },
      tooltip: { trigger: "item" },
      series: [
        {
          type: "pie",
          data: Object.entries(conteo).map(([name, value]) => ({
            name,
            value,
          })),
        },
      ],
    };
  };

  if (cargando) return <div>Cargando datos...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Búsquedas en Redes Sociales</h2>

      <ReactECharts
        option={getOptionSeguidores()}
        style={{ height: "400px", margin: "20px 0" }}
      />

      <ReactECharts
        option={getOptionRedesSociales()}
        style={{ height: "400px", margin: "20px 0" }}
      />

      {/* Puedes agregar más gráficos según necesites */}
    </div>
  );
};

export default ListaBusquedasRRSS;
