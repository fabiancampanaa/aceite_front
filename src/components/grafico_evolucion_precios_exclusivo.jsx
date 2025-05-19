// components/GraficoPreciosMensualesExclusivo.jsx
import React, { useState, useEffect, useMemo } from "react";
import ReactECharts from "echarts-for-react";
import { getAllBusquedas } from "../api/busquedas.api";
import { Card, Button, Empty } from "antd";
import moment from "moment";
import "moment/locale/es";
import Filtros from "./filtros";

moment.locale("es");

const GraficoPreciosMensualesExclusivo = ({ showMarca = true }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    productos: [],
    envases: [],
    marketplaces: [],
    ...(showMarca && { marcas: [] }),
  });

  const [filterOptions, setFilterOptions] = useState({
    productos: [],
    envases: [],
    marketplaces: [],
    ...(showMarca && { marcas: [] }),
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getAllBusquedas();
        setData(res.data);

        const productos = [
          ...new Set(res.data.map((item) => item.producto?.toUpperCase())),
        ].filter(Boolean);
        const envases = [
          ...new Set(res.data.map((item) => item.envase)),
        ].filter(Boolean);
        const marketplaces = [
          ...new Set(res.data.map((item) => item.identificacion_url)),
        ].filter(Boolean);
        const marcas = [...new Set(res.data.map((item) => item.marca))].filter(
          Boolean
        );

        setFilterOptions({
          productos,
          envases,
          marketplaces,
          ...(showMarca && { marcas }),
        });
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Error al cargar los datos");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [showMarca]);

  const filterItem = (item) => {
    const producto = item.producto?.toUpperCase();
    return (
      (filters.productos.length === 0 ||
        filters.productos.includes(producto)) &&
      (filters.envases.length === 0 || filters.envases.includes(item.envase)) &&
      (filters.marketplaces.length === 0 ||
        filters.marketplaces.includes(item.identificacion_url)) &&
      (!showMarca ||
        filters.marcas.length === 0 ||
        filters.marcas.includes(item.marca))
    );
  };

  useEffect(() => {
    const filteredItems = data.filter(filterItem);

    setFilterOptions({
      productos: [
        ...new Set(
          filteredItems.map((i) => i.producto?.toUpperCase()).filter(Boolean)
        ),
      ],
      envases: [...new Set(filteredItems.map((i) => i.envase).filter(Boolean))],
      marketplaces: [
        ...new Set(
          filteredItems.map((i) => i.identificacion_url).filter(Boolean)
        ),
      ],
      ...(showMarca && {
        marcas: [...new Set(filteredItems.map((i) => i.marca).filter(Boolean))],
      }),
    });
  }, [filters, data, showMarca]);

  const handleFilterChange = (filterName, value) => {
    setFilters((prev) => ({ ...prev, [filterName]: value }));
  };

  const resetFilters = () => {
    setFilters({
      productos: [],
      envases: [],
      marketplaces: [],
      ...(showMarca && { marcas: [] }),
    });
  };

  const filteredData = useMemo(
    () => data.filter(filterItem),
    [data, filters, showMarca]
  );

  const processData = () => {
    if (
      filters.productos.length === 0 &&
      filters.envases.length === 0 &&
      filters.marketplaces.length === 0 &&
      (!showMarca || filters.marcas.length === 0)
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
        const entry = monthlyData[month].marketplaces[marketplace];
        entry.total += precio;
        entry.count++;
        entry.min = Math.min(entry.min, precio);
        entry.max = Math.max(entry.max, precio);
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
        const entry = monthlyData[month].marketplaces[marketplace];
        if (!entry) return null;

        const promedio = parseFloat((entry.total / entry.count).toFixed(0));
        return {
          value: promedio,
          min: entry.min,
          max: entry.max,
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
        selected: marketplaces.reduce((acc, name) => {
          acc[name] = false; // Desactivado por defecto
          return acc;
        }, {}),
        bottom: 0,
      },
      xAxis: {
        type: "category",
        data: months.map((m) => moment(m).format("MMM YY")),
        axisLabel: { rotate: 45, interval: 0 },
      },
      yAxis: {
        type: "value",
        axisLabel: { formatter: "${value}" },
      },
      series,
      grid: { bottom: "15%" },
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
        title="Evolución de Precios con IVA homologado a un litro de aceite"
        extra={
          <Button
            onClick={resetFilters}
            disabled={Object.values(filters).every((arr) => arr.length === 0)}
          >
            Limpiar filtros
          </Button>
        }
      >
        <Filtros
          filters={filters}
          filterOptions={filterOptions}
          onFilterChange={handleFilterChange}
          showMarca={showMarca}
        />

        {!chartOption ? (
          <Empty
            description={
              Object.values(filters).every((arr) => arr.length === 0)
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

export default GraficoPreciosMensualesExclusivo;
