import React, { useState, useEffect, useMemo } from "react";

import ReactECharts from "echarts-for-react";
import { getAllBusquedas } from "../api/busquedas.api";

const GraficoPreciosHistorico = () => {
  const [dataJson, setDataJson] = useState([]);

  useEffect(() => {
    async function cargarBusquedas() {
      const res = await getAllBusquedas();
      setDataJson(res.data);
    }
    cargarBusquedas();
  }, []);

  // Procesar los datos para el gráfico de líneas
  const processData = (data) => {
    const brands = {};

    // Agrupar los datos por marca y fecha
    data.forEach((item) => {
      if (!brands[item.marca]) {
        brands[item.marca] = {};
      }
      if (!brands[item.marca][item.fecha_extraccion]) {
        brands[item.marca][item.fecha_extraccion] = [];
      }
      brands[item.marca][item.fecha_extraccion].push(item.valor);
    });

    // Preparar las series para el gráfico
    const series = [];
    const xAxisData = [
      ...new Set(data.map((item) => item.fecha_extraccion)),
    ].sort(); // Obtener fechas únicas y ordenadas

    Object.keys(brands).forEach((brand) => {
      const brandData = xAxisData.map((date) => {
        const prices = brands[brand][date];
        return prices
          ? prices.reduce((sum, price) => sum + price, 0) / prices.length
          : null; // Promedio de precios por fecha
      });

      series.push({
        name: brand,
        type: "line",
        data: brandData,
      });
    });

    return {
      xAxis: {
        type: "category",
        data: xAxisData,
        name: "Fecha de Extracción",
        nameLocation: "middle",
        nameGap: 30,
      },
      yAxis: {
        type: "value",
        name: "Precio",
        nameLocation: "middle",
        nameGap: 30,
      },
      tooltip: {
        trigger: "axis",
      },
      legend: {
        data: Object.keys(brands),
        bottom: 10,
      },
      series: series,
    };
  };

  const options = processData(dataJson);

  return (
    <div>
      <h2>Precios Historicos </h2>
      <ReactECharts
        option={options}
        style={{ height: "400px", width: "100%" }}
      />
    </div>
  );
};

export default GraficoPreciosHistorico;
