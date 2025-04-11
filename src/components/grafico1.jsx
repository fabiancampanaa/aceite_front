import React, { useState, useEffect } from "react";
import ReactECharts from "echarts-for-react";
import { getAllBusquedas } from "../api/busquedas.api";

const GraficoBarras = () => {
  const [dataJson, setDataJson] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function cargarBusquedas() {
      try {
        const res = await getAllBusquedas();
        setDataJson(res.data);
      } catch (err) {
        setError("Error al cargar los datos");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    cargarBusquedas();
  }, []);

  // Colores para las barras
  const colors = [
    "#5470C6",
    "#91CC75",
    "#FAC858",
    "#EE6666",
    "#73C0DE",
    "#3BA272",
    "#FC8452",
    "#9A60B4",
  ];

  // Procesar los datos para el gráfico
  const processData = (data) => {
    const brands = {};

    // Agrupar por marca y calcular promedio de precios
    data.forEach((item) => {
      if (!brands[item.marca]) {
        brands[item.marca] = [];
      }
      brands[item.marca].push(item.valor);
    });

    const series = [];
    const xAxisData = Object.keys(brands);

    xAxisData.forEach((brand, brandIndex) => {
      series.push({
        name: brand,
        type: "bar",
        data: brands[brand].map((valor, index) => ({
          value: valor,
          itemId: `${brand}-${index}`, // Identificador único
        })),
        label: {
          show: true,
          position: "top",
          formatter: (params) =>
            `$${Math.round(params.value).toLocaleString("es-CL")}`,
        },
        itemStyle: {
          color: colors[brandIndex % colors.length],
        },
      });
    });

    return {
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "shadow",
        },
        formatter: (params) => {
          const data = params[0];
          return `
            <strong>${data.name}</strong><br/>
            Precio promedio: $${Math.round(data.value).toLocaleString(
              "es-CL"
            )}<br/>
            Productos: ${brands[data.name].length}
          `;
        },
      },
      legend: {
        data: xAxisData,
        bottom: 10,
        itemWidth: 20,
        itemHeight: 12,
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "15%",
        top: "10%",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        data: xAxisData, // Ahora muestra todas las marcas en el eje X
      },
      yAxis: {
        type: "value",
        name: "Precio (CLP)",
        nameLocation: "middle",
        nameGap: 60,
        axisLabel: {
          formatter: (value) => `$${Math.round(value).toLocaleString("es-CL")}`,
        },
      },
      series: series,
      color: colors,
    };
  };

  if (loading) return <div>Cargando datos...</div>;
  if (error) return <div>{error}</div>;
  if (dataJson.length === 0) return <div>No hay datos disponibles</div>;

  return (
    <div style={{ padding: "30px" }}>
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
        Precios de Aceite de Oliva por Marca
      </h2>
      <ReactECharts
        option={processData(dataJson)}
        style={{ height: "500px", width: "100%" }}
        theme="light"
      />
    </div>
  );
};

export default GraficoBarras;
