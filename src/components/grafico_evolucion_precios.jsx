import React, { useState, useEffect, useMemo } from "react";
import ReactECharts from "echarts-for-react";
import { getAllBusquedas } from "../api/busquedas.api";
import { Select, Card, Row, Col, Button, Empty, Tag } from "antd";
import moment from "moment";
import "moment/locale/es";

const { Option } = Select;

moment.locale("es");

const GraficoPreciosMensuales = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    productos: [],
    envases: [],
    marketplaces: [],
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

        // Opciones generales para todos los filtros
        const productos = [
          ...new Set(res.data.map((item) => item.producto.toUpperCase())),
        ].filter(Boolean); // Normaliza a mayúsculas
        const envases = [
          ...new Set(res.data.map((item) => item.envase)),
        ].filter(Boolean);
        const marketplaces = [
          ...new Set(res.data.map((item) => item.identificacion_url)),
        ].filter(Boolean);

        setFilterOptions({
          productos,
          envases,
          marketplaces,
        });
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Error al cargar los datos");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Actualizar las opciones de los filtros basados en los filtros seleccionados
  useEffect(() => {
    const filteredEnvases = new Set();
    const filteredMarketplaces = new Set();
    const filteredProductos = new Set();

    // Filtrar los envases, marketplaces y productos según los filtros seleccionados
    data.forEach((item) => {
      if (
        (filters.productos.length === 0 ||
          filters.productos.includes(item.producto.toUpperCase())) &&
        (filters.envases.length === 0 ||
          filters.envases.includes(item.envase)) &&
        (filters.marketplaces.length === 0 ||
          filters.marketplaces.includes(item.identificacion_url))
      ) {
        filteredEnvases.add(item.envase);
        filteredMarketplaces.add(item.identificacion_url);
        filteredProductos.add(item.producto.toUpperCase()); // Normaliza el producto a mayúsculas
      }
    });

    // Actualizar las opciones de filtros
    setFilterOptions((prevOptions) => ({
      productos: Array.from(filteredProductos),
      envases: Array.from(filteredEnvases),
      marketplaces: Array.from(filteredMarketplaces),
    }));
  }, [filters, data]);

  const handleFilterChange = (filterName, value) => {
    setFilters((prev) => ({ ...prev, [filterName]: value }));
  };

  const resetFilters = () => {
    setFilters({
      productos: [],
      envases: [],
      marketplaces: [],
    });
  };

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      return (
        (filters.productos.length === 0 ||
          filters.productos.includes(item.producto.toUpperCase())) &&
        (filters.envases.length === 0 ||
          filters.envases.includes(item.envase)) &&
        (filters.marketplaces.length === 0 ||
          filters.marketplaces.includes(item.identificacion_url))
      );
    });
  }, [data, filters]);

  const processData = () => {
    if (
      filters.productos.length === 0 &&
      filters.envases.length === 0 &&
      filters.marketplaces.length === 0
    ) {
      return null;
    }

    if (filteredData.length === 0) {
      return null;
    }

    const monthlyData = {};

    filteredData.forEach((item) => {
      if (!item.fecha_extraccion) return;

      const month = moment(item.fecha_extraccion).format("YYYY-MM");

      if (!monthlyData[month]) {
        monthlyData[month] = {
          marketplaces: {},
          minDate: item.fecha_extraccion,
          maxDate: item.fecha_extraccion,
        };
      }

      const marketplace = item.identificacion_url || "Sin marketplace";
      const precio = parseFloat(item.precio_litro) || 0;

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

    const months = Object.keys(monthlyData).sort((a, b) =>
      moment(a, "YYYY-MM").diff(moment(b, "YYYY-MM"))
    );

    const marketplaces = [
      ...new Set(
        filteredData.map((item) => item.identificacion_url).filter(Boolean)
      ),
    ];

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

  const chartOption = processData();

  if (loading) {
    return (
      <div style={{ padding: 20, textAlign: "center" }}>Cargando datos...</div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 20, textAlign: "center", color: "red" }}>
        {error}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div style={{ padding: 20, textAlign: "center" }}>
        No hay datos disponibles
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <Card
        title="Evolución de Precios"
        extra={
          <Button
            onClick={resetFilters}
            disabled={
              filters.productos.length === 0 &&
              filters.envases.length === 0 &&
              filters.marketplaces.length === 0
            }
          >
            Limpiar filtros
          </Button>
        }
      >
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={8}>
            <Select
              mode="multiple"
              style={{ width: "100%" }}
              placeholder="Filtrar por marketplace(s)"
              value={filters.marketplaces}
              onChange={(value) => handleFilterChange("marketplaces", value)}
              allowClear
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              tagRender={({ label, closable, onClose }) => (
                <Tag
                  closable={closable}
                  onClose={onClose}
                  style={{ marginRight: 3 }}
                >
                  {label}
                </Tag>
              )}
            >
              {filterOptions.marketplaces.map((mp) => (
                <Option key={mp} value={mp}>
                  {mp}
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={8}>
            <Select
              mode="multiple"
              style={{ width: "100%" }}
              placeholder="Filtrar por envase(s)"
              value={filters.envases}
              onChange={(value) => handleFilterChange("envases", value)}
              allowClear
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              tagRender={({ label, closable, onClose }) => (
                <Tag
                  closable={closable}
                  onClose={onClose}
                  style={{ marginRight: 3 }}
                >
                  {label}
                </Tag>
              )}
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
              mode="multiple"
              style={{ width: "100%" }}
              placeholder="Filtrar por producto(s)"
              value={filters.productos}
              onChange={(value) => handleFilterChange("productos", value)}
              allowClear
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              tagRender={({ label, closable, onClose }) => (
                <Tag
                  closable={closable}
                  onClose={onClose}
                  style={{ marginRight: 3 }}
                >
                  {label}
                </Tag>
              )}
            >
              {filterOptions.productos.map((producto) => (
                <Option key={producto} value={producto}>
                  {producto}
                </Option>
              ))}
            </Select>
          </Col>
        </Row>

        {!chartOption ? (
          <Empty
            description={
              filters.productos.length === 0 &&
              filters.envases.length === 0 &&
              filters.marketplaces.length === 0
                ? "Por favor, seleccione al menos un filtro para visualizar los datos"
                : "No hay datos disponibles con los filtros seleccionados"
            }
            style={{ padding: 30 }}
          />
        ) : (
          <ReactECharts
            option={chartOption}
            style={{ height: "600px", width: "100%" }}
            theme="light"
          />
        )}
      </Card>
    </div>
  );
};

export default GraficoPreciosMensuales;
