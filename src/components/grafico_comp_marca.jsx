import React, { useState, useEffect, useMemo } from "react";
import ReactECharts from "echarts-for-react";
import { getAllBusquedas } from "../api/busquedas.api";

const GraficoPrecioAceitePorMarca = () => {
  const [dataJson, setDataJson] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mesSeleccionado, setMesSeleccionado] = useState("");
  const [mesesDisponibles, setMesesDisponibles] = useState([]);
  const [modoFecha, setModoFecha] = useState("mes");
  const [tipoEnvaseSeleccionado, setTipoEnvaseSeleccionado] = useState("");
  const [tiposEnvaseDisponibles, setTiposEnvaseDisponibles] = useState([]);

  useEffect(() => {
    async function cargarBusquedas() {
      try {
        const res = await getAllBusquedas();
        setDataJson(res.data);

        const años = Array.from(
          new Set(
            res.data
              .map((item) =>
                item.fecha_extraccion ? item.fecha_extraccion.slice(0, 4) : null
              )
              .filter((a) => a !== null)
          )
        ).sort((a, b) => b.localeCompare(a));

        const meses = Array.from(
          new Set(
            res.data
              .map((item) =>
                item.fecha_extraccion ? item.fecha_extraccion.slice(0, 7) : null
              )
              .filter((m) => m !== null)
          )
        ).sort((a, b) => b.localeCompare(a));

        const tiposEnvase = Array.from(
          new Set(res.data.map((item) => item.envase).filter((tipo) => tipo))
        );

        setTiposEnvaseDisponibles(tiposEnvase);
        setMesesDisponibles([...meses, ...años]);
        if (meses.length > 0) setMesSeleccionado(meses[0]);
      } catch (err) {
        setError("Error al cargar los datos");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    cargarBusquedas();
  }, []);

  const procesarDatos = (data) => {
    const datosFiltrados = data.filter((item) => {
      const tienePrecio = item.precio_litro !== null && item.precio_litro > 0;
      const perteneceAFecha =
        item.fecha_extraccion &&
        (modoFecha === "mes"
          ? item.fecha_extraccion.startsWith(mesSeleccionado)
          : item.fecha_extraccion.startsWith(mesSeleccionado.slice(0, 4)));
      const perteneceATipoEnvase =
        tipoEnvaseSeleccionado === "" || item.envase === tipoEnvaseSeleccionado;

      return tienePrecio && perteneceAFecha && perteneceATipoEnvase;
    });

    const preciosPorMarca = {};
    datosFiltrados.forEach((item) => {
      const marca = item.marca ? item.marca.trim() : "Sin marca";
      if (!preciosPorMarca[marca]) preciosPorMarca[marca] = [];
      preciosPorMarca[marca].push(parseFloat(item.precio_litro));
    });

    const promedioPorMarca = Object.entries(preciosPorMarca).map(
      ([marca, precios]) => ({
        marca,
        promedio: precios.reduce((a, b) => a + b, 0) / precios.length,
      })
    );

    promedioPorMarca.sort((a, b) => a.promedio - b.promedio);

    return {
      tooltip: {
        trigger: "item",
        formatter: (params) =>
          `<strong style="color: black;">${
            params.name
          }</strong><br/>Precio promedio por litro: $${new Intl.NumberFormat(
            "es-ES"
          ).format(Math.round(params.value))}`,
      },
      grid: {
        left: "20%",
        right: "4%",
        bottom: "3%",
        top: "10%",
        containLabel: true,
      },
      xAxis: {
        type: "value",
        name: "Precio por litro (sin IVA)",
        nameLocation: "middle",
        nameGap: 25,
        axisLine: {
          show: false,
        },
        splitLine: {
          show: false,
        },
        axisLabel: {
          show: false,
        },
      },
      yAxis: {
        type: "category",
        data: promedioPorMarca.map((item) =>
          item.marca.length > 30 ? item.marca.slice(0, 27) + "..." : item.marca
        ),
        axisLabel: {
          interval: 0, // <-- Mostrar todas las etiquetas
          formatter: function (value) {
            return value.length > 30 ? value.slice(0, 27) + "..." : value;
          },
        },
      },
      series: [
        {
          type: "bar",
          name: "Precio por litro",
          data: promedioPorMarca.map((item) => ({
            value: item.promedio,
            name: item.marca,
            itemStyle: {
              color: [
                "Albiña",
                "Payantume",
                "Alma del Huasco",
                "Azaitt",
              ].includes(item.marca)
                ? "#B02F3C" // Rojo para destacar
                : "#5470C6", // Color normal
            },
          })),
          itemStyle: {
            color: "#5470C6",
          },
          label: {
            show: true,
            position: "right",
            fontSize: 12,
            color: "#fff",
            fontWeight: "bold",
            formatter: (params) =>
              `$${new Intl.NumberFormat("es-ES").format(
                params.value.toFixed(0)
              )}`,
          },
        },
      ],
    };
  };

  const opcionesGrafico = useMemo(
    () => procesarDatos(dataJson),
    [dataJson, mesSeleccionado, modoFecha, tipoEnvaseSeleccionado]
  );

  if (loading) return <div>Cargando datos...</div>;
  if (error) return <div>{error}</div>;
  if (!mesSeleccionado) return <div>No hay meses disponibles.</div>;

  const formatearMes = (val) => {
    const [year, month] = val.split("-");
    const date = new Date(year, parseInt(month) - 1);
    const nombreMes = new Intl.DateTimeFormat("es-ES", {
      month: "long",
      year: "numeric",
    }).format(date);
    return nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1);
  };

  return (
    <div style={{ padding: "30px" }}>
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
        Precio Promedio con IVA por un Litro de Aceite (por Marca)
      </h2>

      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <label htmlFor="modoFecha" style={{ marginRight: "10px" }}>
          Ver por:
        </label>
        <select
          id="modoFecha"
          value={modoFecha}
          onChange={(e) => setModoFecha(e.target.value)}
          style={{ marginRight: "20px" }}
        >
          <option value="mes">Mes</option>
          <option value="año">Año</option>
        </select>

        <select
          id="selectorMes"
          value={mesSeleccionado}
          onChange={(e) => setMesSeleccionado(e.target.value)}
        >
          {mesesDisponibles
            .filter((val) =>
              modoFecha === "mes" ? val.length === 7 : val.length === 4
            )
            .map((val) => (
              <option key={val} value={val}>
                {modoFecha === "mes" ? formatearMes(val) : val}
              </option>
            ))}
        </select>

        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <label htmlFor="tipoEnvase" style={{ marginRight: "10px" }}>
            Tipo de envase:
          </label>
          <select
            id="tipoEnvase"
            value={tipoEnvaseSeleccionado}
            onChange={(e) => setTipoEnvaseSeleccionado(e.target.value)}
          >
            <option value="">Todos</option>
            {tiposEnvaseDisponibles.map((tipo, index) => (
              <option key={index} value={tipo}>
                {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <ReactECharts
        option={opcionesGrafico}
        style={{ height: "600px", width: "100%" }}
        theme="light"
      />
    </div>
  );
};

export default GraficoPrecioAceitePorMarca;
