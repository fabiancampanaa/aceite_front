import React, { useState, useEffect } from "react";
import ReactECharts from "echarts-for-react";
import { Select, Spin, Alert } from "antd";
import { getAllBusquedas } from "../api/busquedas.api";

const { Option } = Select;

const GraficoPreciosHistorico = () => {
  const [dataJson, setDataJson] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [allBrands, setAllBrands] = useState([]);

  useEffect(() => {
    async function cargarBusquedas() {
      try {
        const res = await getAllBusquedas();
        setDataJson(res.data);

        // Obtener todas las marcas únicas
        const uniqueBrands = [...new Set(res.data.map((item) => item.marca))];
        setAllBrands(uniqueBrands);
        setSelectedBrands(uniqueBrands.slice(0, 3)); // Seleccionar primeras 3 por defecto, EVALUAR QUITARLO
      } catch (err) {
        setError("Error al cargar los datos históricos");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    cargarBusquedas();
  }, []);

  // Colores para las líneas
  const colors = [
    "#5470C6",
    "#91CC75",
    "#EE6666",
    "#FAC858",
    "#73C0DE",
    "#3BA272",
    "#FC8452",
    "#9A60B4",
  ];

  // Procesar los datos para el gráfico
  const processData = (data, brandsToShow) => {
    const brandsData = {};
    const allDates = [];

    // Agrupar datos por marca y fecha
    data.forEach((item) => {
      if (!brandsToShow.includes(item.marca)) return;

      if (!brandsData[item.marca]) {
        brandsData[item.marca] = {};
      }

      if (!brandsData[item.marca][item.fecha_extraccion]) {
        brandsData[item.marca][item.fecha_extraccion] = [];
      }

      brandsData[item.marca][item.fecha_extraccion].push(item.valor);
      allDates.push(item.fecha_extraccion);
    });

    // Ordenar fechas únicas
    const sortedDates = [...new Set(allDates)].sort(
      (a, b) => new Date(a) - new Date(b)
    );

    // Preparar series para cada marca seleccionada
    const series = brandsToShow.map((brand, index) => {
      const brandValues = sortedDates.map((date) => {
        const prices = brandsData[brand]?.[date] || [];
        return prices.length > 0
          ? Math.round(
              prices.reduce((sum, price) => sum + price, 0) / prices.length
            )
          : null;
      });

      return {
        name: brand,
        type: "line",
        data: brandValues,
        symbol: "circle",
        symbolSize: 8,
        lineStyle: {
          width: 3,
        },
        itemStyle: {
          color: colors[index % colors.length],
        },
        label: {
          show: true,
          position: "top",
          formatter: (params) => {
            return params.value
              ? `$${params.value.toLocaleString("es-CL")}`
              : "";
          },
          fontSize: 10,
          fontWeight: "bold",
        },
        emphasis: {
          label: {
            show: true,
            fontWeight: "bold",
          },
        },
      };
    });

    return {
      tooltip: {
        trigger: "axis",
        formatter: (params) => {
          let tooltip = `<div style="font-weight:bold">${params[0].axisValue}</div>`;
          params.forEach((param) => {
            if (param.value) {
              tooltip += `
                <div style="display:flex;align-items:center;margin-top:5px">
                  <span style="display:inline-block;width:10px;height:10px;background:${
                    param.color
                  };margin-right:5px"></span>
                  ${param.seriesName}: <strong>$${param.value.toLocaleString(
                "es-CL"
              )}</strong>
                </div>
              `;
            }
          });
          return tooltip;
        },
      },
      legend: {
        data: brandsToShow,
        bottom: 10,
        itemWidth: 25,
        itemHeight: 14,
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "18%",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        data: sortedDates,
        name: "Fecha de Extracción",
        nameLocation: "middle",
        nameGap: 25,
        axisLabel: {
          formatter: (value) => {
            // Formatear fecha más legible (ej: "01/01/2023")
            return value.split("-").reverse().join("/");
          },
        },
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

  if (loading) return <Spin tip="Cargando datos históricos..." size="large" />;
  if (error) return <Alert message={error} type="error" showIcon />;
  if (dataJson.length === 0)
    return <Alert message="No hay datos disponibles" type="info" showIcon />;

  return (
    <div style={{ padding: "20px" }}>
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
        Evolución Histórica de Precios
      </h2>

      <div style={{ marginBottom: "20px" }}>
        <Select
          mode="multiple"
          style={{ width: "100%", maxWidth: "500px" }}
          placeholder="Seleccione marcas"
          value={selectedBrands}
          onChange={setSelectedBrands}
          optionFilterProp="children"
        >
          {allBrands.map((brand) => (
            <Option key={brand} value={brand}>
              {brand}
            </Option>
          ))}
        </Select>
      </div>

      <ReactECharts
        option={processData(dataJson, selectedBrands)}
        style={{ height: "500px", width: "100%" }}
        theme="light"
      />
    </div>
  );
};

export default GraficoPreciosHistorico;
