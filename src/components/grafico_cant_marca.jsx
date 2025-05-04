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

  const procesarDatosParaGrafico = (data) => {
    const datosFiltrados = data.filter(
      (item) => item.identificacion_url && item.identificacion_url.trim() !== ""
    );
    const marcasPorUrl = {};

    datosFiltrados.forEach((item) => {
      if (!marcasPorUrl[item.identificacion_url]) {
        marcasPorUrl[item.identificacion_url] = new Set();
      }
      marcasPorUrl[item.identificacion_url].add(item.marca);
    });

    const urls = Object.keys(marcasPorUrl);
    const conteoDatos = urls.map((url) => ({
      url,
      cantidad: marcasPorUrl[url].size,
    }));

    conteoDatos.sort((a, b) => b.cantidad - a.cantidad);

    const datosMostrar = conteoDatos.slice(0, 20);

    return {
      tooltip: {
        trigger: "item",
        formatter: (params) => `
          <strong>${params.name}</strong><br/>
          Marcas distintas: ${params.value}
        `,
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
          formatter: (value) =>
            value.length > 30 ? value.substring(0, 27) + "..." : value,
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

  const datosFiltrados = dataJson.filter(
    (item) => item.identificacion_url && item.identificacion_url.trim() !== ""
  );
  const registrosFiltrados = dataJson.length - datosFiltrados.length;

  return (
    <div
      style={{ padding: "30px" }}
      aria-label="Gráfico de productos por marketplace"
    >
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
        Cantidad de Productos por Marketplace
      </h2>
      <ReactECharts
        option={procesarDatosParaGrafico(dataJson)}
        style={{ height: "600px", width: "100%" }}
        theme="light"
      />
      {registrosFiltrados > 0 && (
        <p
          style={{
            textAlign: "center",
            fontStyle: "italic",
            marginTop: "10px",
          }}
        >
          {registrosFiltrados} registros fueron omitidos por no tener
          identificación de URL.
        </p>
      )}
    </div>
  );
};

export default GraficoPorMarketplace;
