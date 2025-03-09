import React, { useState, useEffect, useMemo } from "react";

import ReactECharts from "echarts-for-react";
import { getAllBusquedas } from "../api/busquedas.api";

const GraficoBarras = () => {
  const [dataJson, setDataJson] = useState([]);

  useEffect(() => {
    async function cargarBusquedas() {
      const res = await getAllBusquedas();
      setDataJson(res.data);
    }
    cargarBusquedas();
  }, []);

  // Procesar los datos para el gráfico
  const processData = (data) => {
    const brands = {};
    data.forEach((item) => {
      if (!brands[item.marca]) {
        brands[item.marca] = [];
      }
      brands[item.marca].push(item.valor);
    });

    const series = [];
    const xAxisData = Object.keys(brands);
    xAxisData.forEach((brand) => {
      series.push({
        name: brand,
        type: "bar",
        data: brands[brand],
      });
    });

    return {
      xAxis: {
        type: "category",
        data: xAxisData,
      },
      yAxis: {
        type: "value",
      },
      series: series,
    };
  };

  const options = processData(dataJson);

  return (
    <div>
      <h2>Precios de Aceite de Oliva por Marca</h2>
      <ReactECharts
        option={options}
        style={{ height: "400px", width: "100%" }}
      />
    </div>
  );
};

export default GraficoBarras;
