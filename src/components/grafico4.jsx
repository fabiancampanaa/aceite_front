import React, { useState, useEffect } from "react";
import ReactECharts from "echarts-for-react";
import { getAllBusquedas } from "../api/busquedas.api";
import { Select, Card, Row, Col, Button } from "antd";
import moment from "moment";
import "moment/locale/es";

const { Option } = Select;

moment.locale("es");

const GraficoPreciosMensuales = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    producto: null,
    envase: null,
    marketplace: null,
  });

  const [filterOptions, setFilterOptions] = useState({
    productos: [],
    envases: [],
    marketplaces: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getAllBusquedas();
        setData(res.data);

        // CORRECCIÓN: Se eliminaron los paréntesis extra aquí
        setFilterOptions({
          productos: [...new Set(res.data.map((item) => item.producto))].filter(
            Boolean
          ),
          envases: [...new Set(res.data.map((item) => item.envase))].filter(
            Boolean
          ),
          marketplaces: [
            ...new Set(res.data.map((item) => item.identificacion_url)),
          ].filter(Boolean),
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleFilterChange = (filterName, value) => {
    setFilters((prev) => ({ ...prev, [filterName]: value }));
  };

  const resetFilters = () => {
    setFilters({
      producto: null,
      envase: null,
      marketplace: null,
    });
  };

  const processData = () => {
    // 1. Aplicar filtros
    const filteredData = data.filter((item) => {
      return (
        (!filters.producto || item.producto === filters.producto) &&
        (!filters.envase || item.envase === filters.envase) &&
        (!filters.marketplace ||
          item.identificacion_url === filters.marketplace)
      );
    });

    // 2. Verificar si hay datos después del filtrado
    if (filteredData.length === 0) {
      return {
        xAxis: { type: "category", data: [] },
        yAxis: { type: "value" },
        series: [],
      };
    }

    // 3. Agrupar por mes CORREGIDO
    const monthlyData = {};

    filteredData.forEach((item) => {
      if (!item.fecha_extraccion) return;

      // Formatear mes-año correctamente
      const month = moment(item.fecha_extraccion).format("YYYY-MM");

      if (!monthlyData[month]) {
        monthlyData[month] = {
          marketplaces: {},
          minDate: item.fecha_extraccion,
          maxDate: item.fecha_extraccion,
        };
      }

      // Agrupar por marketplace
      const marketplace = item.identificacion_url || "Sin marketplace";
      const precio = parseFloat(item.valor) || 0;

      if (!monthlyData[month].marketplaces[marketplace]) {
        monthlyData[month].marketplaces[marketplace] = {
          total: precio,
          count: 1,
          min: precio,
          max: precio,
        };
      } else {
        monthlyData[month].marketplaces[marketplace].total += precio;
        monthlyData[month].marketplaces[marketplace].count++;
        monthlyData[month].marketplaces[marketplace].min = Math.min(
          monthlyData[month].marketplaces[marketplace].min,
          precio
        );
        monthlyData[month].marketplaces[marketplace].max = Math.max(
          monthlyData[month].marketplaces[marketplace].max,
          precio
        );
      }
    });

    // 4. Ordenar meses cronológicamente
    const months = Object.keys(monthlyData).sort((a, b) =>
      moment(a, "YYYY-MM").diff(moment(b, "YYYY-MM"))
    );

    // 5. Obtener marketplaces únicos
    const marketplaces = [
      ...new Set(
        filteredData.map((item) => item.identificacion_url).filter(Boolean)
      ),
    ];

    // 6. Preparar series
    const series = marketplaces.map((marketplace) => ({
      name: marketplace,
      type: "line",
      data: months.map((month) => {
        const data = monthlyData[month].marketplaces[marketplace];
        if (!data) return null;

        const promedio = parseFloat((data.total / data.count).toFixed(2));
        return {
          value: promedio,
          min: data.min,
          max: data.max,
          label: {
            show: true,
            formatter: `$${promedio.toLocaleString("es-CL")}`,
            position: "top",
          },
        };
      }),
      symbol: "circle",
      symbolSize: 8,
      lineStyle: { width: 3 },
    }));

    // 7. Configuración final del gráfico
    return {
      tooltip: {
        trigger: "axis",
        formatter: (params) => {
          const month = params[0].axisValue;
          return `
            <b>${moment(month, "YYYY-MM").format("MMMM YYYY")}</b>
            ${params
              .map(
                (p) => `
              <div style="margin-top: 5px">
                <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${
                  p.color
                };margin-right:5px;"></span>
                ${p.seriesName}: $${p.data.value.toLocaleString("es-CL")}
                <small style="color:#666;margin-left:8px">
                  (Min: $${p.data.min.toLocaleString(
                    "es-CL"
                  )} | Max: $${p.data.max.toLocaleString("es-CL")})
                </small>
              </div>
            `
              )
              .join("")}
          `;
        },
      },
      legend: {
        data: marketplaces,
        bottom: 0,
      },
      xAxis: {
        type: "category",
        data: months.map((m) => moment(m).format("MMM YY")),
        axisLabel: {
          rotate: 45,
          interval: 0,
          formatter: (value) => value, // Mostrar todos los valores
        },
      },
      yAxis: {
        type: "value",
        axisLabel: {
          formatter: "${value}",
        },
      },
      series,
      grid: {
        bottom: "15%",
      },
    };
  };

  if (loading)
    return (
      <div style={{ padding: 20, textAlign: "center" }}>Cargando datos...</div>
    );
  if (data.length === 0)
    return (
      <div style={{ padding: 20, textAlign: "center" }}>
        No hay datos disponibles
      </div>
    );

  return (
    <div style={{ padding: 20 }}>
      <Card
        title="Evolución de Precios Mensuales"
        extra={
          <Button
            onClick={resetFilters}
            disabled={
              !filters.producto && !filters.envase && !filters.marketplace
            }
          >
            Limpiar filtros
          </Button>
        }
      >
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={8}>
            <Select
              style={{ width: "100%" }}
              placeholder="Filtrar por producto"
              value={filters.producto}
              onChange={(value) => handleFilterChange("producto", value)}
              allowClear
            >
              {filterOptions.productos.map((producto) => (
                <Option key={producto} value={producto}>
                  {producto}
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={8}>
            <Select
              style={{ width: "100%" }}
              placeholder="Filtrar por envase"
              value={filters.envase}
              onChange={(value) => handleFilterChange("envase", value)}
              allowClear
            >
              {filterOptions.envases.map((envase) => (
                <Option key={envase} value={envase}>
                  {envase}
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={8}>
            <Select
              style={{ width: "100%" }}
              placeholder="Filtrar por marketplace"
              value={filters.marketplace}
              onChange={(value) => handleFilterChange("marketplace", value)}
              allowClear
            >
              {filterOptions.marketplaces.map((mp) => (
                <Option key={mp} value={mp}>
                  {mp}
                </Option>
              ))}
            </Select>
          </Col>
        </Row>

        <ReactECharts
          option={processData()}
          style={{ height: "600px", width: "100%" }} // Aumentamos un poco la altura
          theme="light"
        />
      </Card>
    </div>
  );
};

export default GraficoPreciosMensuales;
