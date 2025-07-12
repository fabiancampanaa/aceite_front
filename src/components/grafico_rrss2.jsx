import React, { useState, useEffect, useMemo } from "react";
import { getAllBusquedasrrss } from "../api/busquedas.api";
import ReactECharts from "echarts-for-react";

const colorMarcas = {
  Albiña: "#B02F3C",
  "Alma del Huasco": "#B02F3C",
  Azzait: "#B02F3C",
  Payantume: "#B02F3C",
};

const ListaBusquedasRRSSMarca = () => {
  const [busquedas, setBusquedas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const obtenerBusquedas = async () => {
      try {
        const respuesta = await getAllBusquedasrrss();
        setBusquedas(respuesta.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setCargando(false);
      }
    };
    obtenerBusquedas();
  }, []);

  const optionSeguidores = useMemo(() => {
    if (busquedas.length === 0) return {};

    const fechas = busquedas.map((item) => new Date(item.fecha_registro));
    const fechaMax = new Date(Math.max(...fechas));

    const datosUltimaFecha = busquedas.filter((item) => {
      const fecha = new Date(item.fecha_registro);
      return (
        item.rrss?.toLowerCase() === "instagram" &&
        fecha.toDateString() === fechaMax.toDateString()
      );
    });

    const datosPorMarca = datosUltimaFecha.reduce((acc, item) => {
      const marca = item?.marca?.trim() || "Sin Marca";
      const seguidores = Number(item?.seguidores) || 0;

      if (!acc[marca]) acc[marca] = { total: 0, count: 0 };

      acc[marca].total += seguidores;
      acc[marca].count += 1;

      return acc;
    }, {});

    // Ordenar marcas por promedio descendente
    let marcas = Object.keys(datosPorMarca);
    const marcasConPromedio = marcas.map((marca) => {
      const { total, count } = datosPorMarca[marca];
      const promedio = count > 0 ? total / count : 0;
      return { marca, promedio };
    });
    marcasConPromedio.sort((a, b) => b.promedio - a.promedio);
    marcas = marcasConPromedio.map((item) => item.marca);

    const datos = marcasConPromedio.map((item) => ({
      value: item.promedio,
      itemStyle: { color: colorMarcas[item.marca] || "#5470C6" },
    }));

    const tituloFecha = fechaMax.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
    });

    return {
      title: {
        text: `Seguidores a ${tituloFecha}`,
        left: "center",
        textStyle: { color: "#fff" },
      },
      tooltip: {
        formatter: (params) =>
          `${params.name}: ${Number(params.value).toLocaleString()}`,
      },
      backgroundColor: "#2c343c",
      xAxis: {
        data: marcas,
        axisLabel: { color: "#fff", interval: 0, rotate: 30 },
      },
      yAxis: {
        axisLabel: { color: "#fff" },
      },
      series: [
        {
          name: "Promedio de Seguidores",
          type: "bar",
          data: datos,
          label: {
            show: true,
            position: "top",
            fontSize: 13,
            color: "#fff",
            fontWeight: "bold",
            formatter: (params) => Number(params.value).toLocaleString(),
          },
        },
      ],
    };
  }, [busquedas]);

  if (cargando) return <p role="alert">Cargando datos...</p>;
  if (error) return <p role="alert">Error: {error}</p>;

  return (
    <div>
      <ReactECharts
        option={optionSeguidores}
        style={{ height: "400px", margin: "20px 0" }}
      />
    </div>
  );
};

export default ListaBusquedasRRSSMarca;
