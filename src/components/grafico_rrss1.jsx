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

  // Configuración gráfico circular: Distribución de Redes Sociales
  const getOptionRedesSociales = () => {
    const conteo = busquedas.reduce((acc, item) => {
      acc[item.rrss] = (acc[item.rrss] || 0) + 1;
      return acc;
    }, {});

    return {
      color: ["#B02F3C", "#38ad28ff", "#2598dac2", "#32CD32", "#1E90FF"],
      title: {
        text: "Distribución por Red Social",
        left: "center",
        textStyle: {
          color: "#fff",
        },
      },
      tooltip: { trigger: "item" },
      legend: {
        orient: "vertical",
        left: "left",
        textStyle: {
          color: "#fff",
        },
      },
      series: [
        {
          type: "pie",
          radius: "60%",
          data: Object.entries(conteo).map(([name, value]) => ({
            name,
            value,
          })),
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: "rgba(0, 0, 0, 0.5)",
            },
          },
          label: {
            formatter: "{b}: {c} ({d}%)",
            color: "#fff", // Aquí se define el color blanco para las etiquetas
          },
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
        option={getOptionRedesSociales()}
        style={{ height: "400px", margin: "20px 0" }}
      />

      {/* Puedes agregar más gráficos según necesites */}
    </div>
  );
};

export default ListaBusquedasRRSS;
