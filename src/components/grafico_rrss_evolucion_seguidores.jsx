import React, { useState, useEffect, useMemo } from "react";
import { getAllBusquedasrrss } from "../api/busquedas.api";
import ReactECharts from "echarts-for-react";

const ListaBusquedasRRSSMarca = () => {
  const [busquedas, setBusquedas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const obtenerBusquedas = async () => {
      try {
        const respuesta = await getAllBusquedasrrss();
        setBusquedas(respuesta.data);
        setCargando(false);
      } catch (err) {
        setError(err.message);
        setCargando(false);
      }
    };
    obtenerBusquedas();
  }, []);

  const getOptionEvolucionSeguidores = () => {
    const datosInstagram = busquedas.filter(
      (item) => (item.rrss || "").toLowerCase() === "instagram"
    );

    const datosPorMarca = {};

    datosInstagram.forEach((item) => {
      const marca = item?.marca?.trim() || "Sin Marca";
      const fecha = item?.fecha_registro?.split("T")[0]; // formato YYYY-MM-DD
      const seguidores = Number(item?.seguidores) || 0;

      if (!datosPorMarca[marca]) {
        datosPorMarca[marca] = {};
      }

      if (!datosPorMarca[marca][fecha]) {
        datosPorMarca[marca][fecha] = [];
      }

      datosPorMarca[marca][fecha].push(seguidores);
    });

    const todasFechas = Array.from(
      new Set(datosInstagram.map((item) => item.fecha_registro?.split("T")[0]))
    ).sort();

    const series = Object.keys(datosPorMarca).map((marca) => {
      const datosSerie = todasFechas.map((fecha) => {
        const valores = datosPorMarca[marca][fecha];
        if (valores && valores.length > 0) {
          const suma = valores.reduce((acc, val) => acc + val, 0);
          return suma / valores.length;
        }
        return null;
      });

      return {
        name: marca,
        type: "line",
        data: datosSerie,
        connectNulls: true,
        smooth: true,
      };
    });

    const nombresMarcas = Object.keys(datosPorMarca);
    const legendSelected = {};
    nombresMarcas.forEach((marca) => {
      legendSelected[marca] = false; // deseleccionadas por defecto
    });

    return {
      title: {
        text: "Evolución de Seguidores en Instagram por Marca",
        left: "center",
        textStyle: { color: "#fff" },
      },
      label: {
        show: true,
        color: "#fff",
        fontWeight: "bold",
      },

      tooltip: {
        trigger: "axis",
      },
      legend: {
        top: 30,
        textStyle: { color: "#fff" },
        selected: legendSelected,
      },
      backgroundColor: "#2c343c",
      xAxis: {
        type: "category",
        data: todasFechas,
        axisLabel: { color: "#fff", rotate: 30 },
      },
      yAxis: {
        type: "value",
        axisLabel: { color: "#fff" },
      },
      series,
    };
  };

  const opcionesGrafico = useMemo(
    () => getOptionEvolucionSeguidores(),
    [busquedas]
  );

  if (cargando) return <div>Cargando datos...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <ReactECharts
        option={opcionesGrafico}
        style={{ height: "500px", margin: "20px 0" }}
      />
    </div>
  );
};

export default ListaBusquedasRRSSMarca;
