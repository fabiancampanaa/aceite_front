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
    const datosPorMarca = busquedas.reduce((acc, item) => {
      const marca = item.marca || "Sin Marca";
      const seguidores = Number(item.seguidores || 0);

      if (!acc[marca]) {
        acc[marca] = { total: 0, count: 0 };
      }

      acc[marca].total += seguidores;
      acc[marca].count += 1;

      return acc;
    }, {});

    const marcas = Object.keys(datosPorMarca);
    const datos = marcas.map((marca) => {
      const { total, count } = datosPorMarca[marca];
      return count > 0 ? total / count : 0;
    });

    return {
      title: {
        text: "Promedio de Seguidores por Marca",
        left: "center",
        textStyle: {
          color: "#fff",
        },
      },
      tooltip: {},
      xAxis: { data: marcas },
      yAxis: {},
      series: [
        {
          name: "Promedio de Seguidores",
          type: "bar",
          data: datos,
          label: {
            show: true,
            position: "top",
            fontSize: 13,
            color: "#fff",
            fontWeight: "bold",
            formatter: (params) => `${params.value.toFixed(0)}`,
          },
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
