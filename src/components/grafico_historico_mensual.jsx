import React, { useState, useEffect, useMemo } from "react";
import ReactECharts from "echarts-for-react";
import { Select, Spin, Alert, Button } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import { getAllBusquedas } from "../api/busquedas.api";

const { Option } = Select;

const GraficoComparacionPorMarketplace = () => {
  const [dataJson, setDataJson] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [allProductos, setAllProductos] = useState([]);
  const [selectedProductos, setSelectedProductos] = useState([]);

  const [allEnvases, setAllEnvases] = useState([]);
  const [selectedEnvases, setSelectedEnvases] = useState([]);

  useEffect(() => {
    async function cargarBusquedas() {
      try {
        const res = await getAllBusquedas();
        const data = res.data;
        setDataJson(data);

        const uniqueProductos = [...new Set(data.map((item) => item.producto))];
        const uniqueEnvases = [...new Set(data.map((item) => item.envase))];

        setAllProductos(uniqueProductos);
        setAllEnvases(uniqueEnvases);
      } catch (err) {
        setError("Error al cargar los datos");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    cargarBusquedas();
  }, []);

  const handleResetFilters = () => {
    setSelectedProductos([]);
    setSelectedEnvases([]);
  };

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

  const chartOptions = useMemo(() => {
    if (
      !dataJson.length ||
      !selectedProductos.length ||
      !selectedEnvases.length
    )
      return null;

    const filteredData = dataJson.filter(
      (item) =>
        selectedProductos.includes(item.producto) &&
        selectedEnvases.includes(item.envase)
    );

    const groupedData = {};
    const marketplacesSet = new Set();

    filteredData.forEach((item) => {
      const marketplace = item.identificacion_url;
      marketplacesSet.add(marketplace);

      if (!groupedData[item.producto]) {
        groupedData[item.producto] = {};
      }

      if (!groupedData[item.producto][marketplace]) {
        groupedData[item.producto][marketplace] = [];
      }

      groupedData[item.producto][marketplace].push(item.valor);
    });

    const marketplaces = [...marketplacesSet].sort();

    const series = selectedProductos.map((producto, index) => {
      const data = marketplaces.map((market) => {
        const prices = groupedData[producto]?.[market] || [];
        return prices.length
          ? Math.round(prices.reduce((sum, p) => sum + p, 0) / prices.length)
          : null;
      });

      return {
        name: producto,
        type: "bar",
        data,
        barWidth: 40,
        itemStyle: {
          color: colors[index % colors.length],
        },
        label: {
          show: true,
          position: "top",
          formatter: (params) =>
            params.value ? `$${params.value.toLocaleString("es-CL")}` : "",
        },
      };
    });

    return {
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
        formatter: (params) => {
          let tooltip = `<div><strong>${params[0].axisValue}</strong></div>`;
          params.forEach((param) => {
            if (param.value != null) {
              tooltip += `
                <div style="display:flex;align-items:center;margin-top:4px">
                  <span style="display:inline-block;width:10px;height:10px;background:${
                    param.color
                  };margin-right:5px;border-radius:50%"></span>
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
        data: selectedProductos,
        bottom: 10,
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "18%",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        data: marketplaces,
        name: "Marketplace",
        nameLocation: "middle",
        nameGap: 25,
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
      series,
      color: colors,
    };
  }, [dataJson, selectedProductos, selectedEnvases]);

  if (loading) return <Spin tip="Cargando datos..." size="large" />;
  if (error) return <Alert message={error} type="error" showIcon />;
  if (dataJson.length === 0)
    return <Alert message="No hay datos disponibles" type="info" showIcon />;

  return (
    <div style={{ padding: "20px" }}>
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
        Comparación de Precios por Marketplace
      </h2>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "10px",
          marginBottom: "20px",
          alignItems: "center",
        }}
      >
        <Select
          mode="multiple"
          style={{ minWidth: "200px", flex: 1 }}
          placeholder="Seleccione productos"
          value={selectedProductos}
          onChange={setSelectedProductos}
          optionFilterProp="children"
        >
          {allProductos.map((producto) => (
            <Option key={producto} value={producto}>
              {producto}
            </Option>
          ))}
        </Select>

        <Select
          mode="multiple"
          style={{ minWidth: "200px", flex: 1 }}
          placeholder="Seleccione envases"
          value={selectedEnvases}
          onChange={setSelectedEnvases}
          optionFilterProp="children"
        >
          {allEnvases.map((envase) => (
            <Option key={envase} value={envase}>
              {envase}
            </Option>
          ))}
        </Select>

        <Button
          onClick={handleResetFilters}
          icon={<ReloadOutlined />}
          type="default"
          style={{ flexShrink: 0 }}
        >
          Limpiar filtros
        </Button>
      </div>

      {chartOptions ? (
        <ReactECharts
          option={chartOptions}
          style={{ height: "500px", width: "100%" }}
          theme="light"
        />
      ) : (
        <Alert
          message="Seleccione al menos un producto y un envase para visualizar el gráfico"
          type="info"
          showIcon
        />
      )}
    </div>
  );
};

export default GraficoComparacionPorMarketplace;
