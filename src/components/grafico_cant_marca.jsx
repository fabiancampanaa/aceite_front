import React, { useState, useEffect } from "react";
import ReactECharts from "echarts-for-react";
import { getAllBusquedas } from "../api/busquedas.api";

const GraficoPorMarketplace = () => {
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
    // Filtrar datos donde identificacion_url no esté vacío
    const datosFiltrados = data.filter(
      (item) => item.identificacion_url && item.identificacion_url.trim() !== ""
    );

    // Objeto para contar marcas por URL
    const marcasPorUrl = {};

    datosFiltrados.forEach((item) => {
      if (!marcasPorUrl[item.identificacion_url]) {
        marcasPorUrl[item.identificacion_url] = new Set();
      }
      marcasPorUrl[item.identificacion_url].add(item.marca);
    });

    // Convertir a formato para el gráfico
    const urls = Object.keys(marcasPorUrl);
    const conteoDatos = urls.map((url) => ({
      url,
      cantidad: marcasPorUrl[url].size,
    }));

    // Ordenar de mayor a menor cantidad
    conteoDatos.sort((a, b) => b.cantidad - a.cantidad);

    // Tomar solo los primeros 20 para mejor visualización
    const datosMostrar = conteoDatos.slice(0, 20);

    return {
      tooltip: {
        trigger: "item",
        formatter: (params) => {
          return `
            <strong>${params.name}</strong><br/>
            Marcas distintas: ${params.value}<br/>
          `;
        },
      },
      grid: {
        left: "20%",
        right: "4%",
        bottom: "3%",
        top: "10%",
        containLabel: true,
      },
      xAxis: {
        type: "value",
        name: "Cantidad de Marcas",
        nameLocation: "middle",
        nameGap: 25,
      },
      yAxis: {
        type: "category",
        data: datosMostrar.map((item) => item.url),
        axisLabel: {
          formatter: (value) => {
            // Acortar URLs largas para mejor visualización
            if (value.length > 30) {
              return value.substring(0, 27) + "...";
            }
            return value;
          },
        },
      },
      series: [
        {
          name: "Marcas",
          type: "bar",
          data: datosMostrar.map((item) => ({
            value: item.cantidad,
            name: item.url,
          })),
          itemStyle: {
            color: (params) => colors[params.dataIndex % colors.length],
          },
          label: {
            show: true,
            position: "right",
            formatter: (params) => params.value,
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: "rgba(0, 0, 0, 0.5)",
            },
          },
        },
      ],
      color: colors,
    };
  };

  if (loading) return <div>Cargando datos...</div>;
  if (error) return <div>{error}</div>;
  if (dataJson.length === 0) return <div>No hay datos disponibles</div>;

  // Contar cuántos registros fueron filtrados
  const datosFiltrados = dataJson.filter(
    (item) => item.identificacion_url && item.identificacion_url.trim() !== ""
  );
  const registrosFiltrados = dataJson.length - datosFiltrados.length;

  return (
    <div style={{ padding: "30px" }}>
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
        Cantidad de Productos por marketplace
      </h2>
      <ReactECharts
        option={processData(dataJson)}
        style={{ height: "600px", width: "100%" }}
        theme="light"
      />
    </div>
  );
};

export default GraficoPorMarketplace;
