import React, { useState, useEffect } from "react";
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

  // Configuración del gráfico solo para registros de Instagram
  const getOptionSeguidores = () => {
    // Filtrar los registros de la red social "instagram"
    const datosInstagram = busquedas.filter(
      (item) => item.rrss?.toLowerCase() === "instagram"
    );

    // Agrupar por marca y calcular el promedio de seguidores
    const datosPorMarca = datosInstagram.reduce((acc, item) => {
      const marca = item?.marca?.trim() || "Sin Marca";
      const seguidores = Number(item?.seguidores) || 0;

      if (!acc[marca]) {
        acc[marca] = { total: 0, count: 0 };
      }

      acc[marca].total += seguidores;
      acc[marca].count += 1;

      return acc;
    }, {});

    const marcas = Object.keys(datosPorMarca);
    const datos = marcas.map((marca) => {
      const { total, count } = datosPorMarca[marca];
      const promedio = count > 0 ? total / count : 0;

      let color = "#5470C6"; // color por defecto

      if (marca === "Albiña") color = "#06541c";
      if (marca === "Alma del Huasco") color = "#06541c";
      if (marca === "Azzait") color = "#06541c";
      if (marca === "Payantume") color = "#06541c";

      return {
        value: promedio,
        itemStyle: { color },
      };
    });

    return {
      title: {
        text: "Promedio de Seguidores en Instagram por Marca",
        left: "center",
        textStyle: {
          color: "#fff",
        },
      },
      tooltip: {},
      backgroundColor: "#2c343c", // Opcional: fondo oscuro
      xAxis: {
        data: marcas,
        axisLabel: {
          color: "#fff",
          interval: 0,
          rotate: 30,
        },
      },
      yAxis: {
        axisLabel: {
          color: "#fff",
        },
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
            formatter: (params) => `${params.value.toFixed(0)}`,
          },
          itemStyle: {
            color: "#61dafb",
          },
        },
      ],
    };
  };

  if (cargando) return <div>Cargando datos...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <ReactECharts
        option={getOptionSeguidores()}
        style={{ height: "400px", margin: "20px 0" }}
      />
    </div>
  );
};

export default ListaBusquedasRRSSMarca;
