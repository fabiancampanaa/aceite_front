import React, { useState, useEffect } from "react";
import ReactECharts from "echarts-for-react";
import { getAllBusquedas } from "../api/busquedas.api";

const GraficoPrecioAceitePorMarketplaceExclusivo = () => {
  const [dataJson, setDataJson] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mesSeleccionado, setMesSeleccionado] = useState("");
  const [mesesDisponibles, setMesesDisponibles] = useState([]);
  const [modoFecha, setModoFecha] = useState("mes"); // "mes" o "año"
  const [tipoEnvaseSeleccionado, setTipoEnvaseSeleccionado] = useState("");
  const [tiposEnvaseDisponibles, setTiposEnvaseDisponibles] = useState([]);
  const [marcaSeleccionada, setMarcaSeleccionada] = useState("");
  const [marcasDisponibles, setMarcasDisponibles] = useState([]);

  useEffect(() => {
    async function cargarBusquedas() {
      try {
        const res = await getAllBusquedas();
        setDataJson(res.data);
        const años = Array.from(
          new Set(
            res.data
              .map((item) => {
                const año = item.fecha_extraccion
                  ? item.fecha_extraccion.slice(0, 4)
                  : null;

                return año;
              })
              .filter((a) => a !== null)
          )
        ).sort((a, b) => b.localeCompare(a));
        // Extraer meses únicos del campo fecha_extraccion
        const meses = Array.from(
          new Set(
            res.data
              .map((item) => {
                const mes = item.fecha_extraccion
                  ? item.fecha_extraccion.slice(0, 7)
                  : null;

                return mes;
              })
              .filter((m) => m !== null)
          )
        ).sort((a, b) => b.localeCompare(a));

        const tiposEnvase = Array.from(
          new Set(res.data.map((item) => item.envase).filter((tipo) => tipo))
        );

        setTiposEnvaseDisponibles(tiposEnvase);

        const marcas = Array.from(
          new Set(res.data.map((item) => item.marca).filter((m) => m))
        );
        setMarcasDisponibles(marcas);

        setMesesDisponibles([...meses, ...años]);
        if (meses.length > 0) setMesSeleccionado(meses[0]); // Por defecto: el más reciente
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
      // Verificar si tiene precio
      const tienePrecio = item.precio_litro !== null && item.precio_litro > 0;

      // Verificar si la fecha pertenece al mes o año seleccionado
      const perteneceAFecha =
        item.fecha_extraccion &&
        (modoFecha === "mes"
          ? item.fecha_extraccion.startsWith(mesSeleccionado) // Mes completo (YYYY-MM)
          : item.fecha_extraccion.startsWith(mesSeleccionado.slice(0, 4))); // Año (YYYY)
      const perteneceATipoEnvase =
        tipoEnvaseSeleccionado === "" || item.envase === tipoEnvaseSeleccionado;
      const perteneceAMarca =
        marcaSeleccionada === "" || item.marca === marcaSeleccionada;
      return (
        tienePrecio &&
        perteneceAFecha &&
        perteneceATipoEnvase &&
        perteneceAMarca
      ); // Solo retorna el item si tiene precio y pertenece a la fecha
    });

    const preciosPorUrl = {};
    datosFiltrados.forEach((item) => {
      const url = item.identificacion_url;
      if (!preciosPorUrl[url]) preciosPorUrl[url] = [];
      preciosPorUrl[url].push(parseFloat(item.precio_litro));
    });
    const promedioPorUrl = Object.entries(preciosPorUrl).map(
      ([url, precios]) => ({
        url,
        promedio: precios.reduce((a, b) => a + b, 0) / precios.length,
      })
    );
    promedioPorUrl.sort((a, b) => a.promedio - b.promedio);

    return {
      tooltip: {
        trigger: "item",
        formatter: (params) => `
          <strong>${params.name}</strong><br/>
          Precio promedio por litro: $${params.value.toFixed(2)}
        `,
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
        data: promedioPorUrl.map((item) =>
          item.url.length > 30 ? item.url.slice(0, 27) + "..." : item.url
        ),
      },
      series: [
        {
          type: "bar",
          name: "Precio por litro",
          data: promedioPorUrl.map((item) => ({
            value: item.promedio,
            name: item.url,
          })),
          itemStyle: {
            color: "#5470C6",
          },
          label: {
            show: true,
            position: "right",
            fontSize: 13, // Tamaño de la fuente para las etiquetas dentro de las barras
            color: "#fff", // Color de la etiqueta
            fontWeight: "bold", // Hacer la etiqueta en negrita
            formatter: (params) => `$${params.value.toFixed(0)}`,
          },
        },
      ],
    };
  };

  if (loading) return <div>Cargando datos...</div>;
  if (error) return <div>{error}</div>;
  if (!mesSeleccionado) return <div>No hay meses disponibles.</div>;
  return (
    <div style={{ padding: "30px" }}>
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
        Precio Promedio con IVA por un Litro de Aceite
      </h2>

      {/* Selector de mes */}
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
            .map((val) => {
              if (modoFecha === "mes") {
                const [year, month] = val.split("-");
                const date = new Date(year, parseInt(month) - 1);
                const nombreMes = new Intl.DateTimeFormat("es-ES", {
                  month: "long",
                  year: "numeric",
                }).format(date);
                return (
                  <option key={val} value={val}>
                    {nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1)}
                  </option>
                );
              } else {
                return (
                  <option key={val} value={val}>
                    {val}
                  </option>
                );
              }
            })}
        </select>
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
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
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <label htmlFor="marca" style={{ marginRight: "10px" }}>
            Marca:
          </label>
          <select
            id="marca"
            value={marcaSeleccionada}
            onChange={(e) => setMarcaSeleccionada(e.target.value)}
          >
            <option value="">Todas</option>
            {marcasDisponibles.map((marca, index) => (
              <option key={index} value={marca}>
                {marca.charAt(0).toUpperCase() + marca.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <ReactECharts
        option={procesarDatos(dataJson)}
        style={{ height: "600px", width: "100%" }}
        theme="light"
      />
    </div>
  );
};

export default GraficoPrecioAceitePorMarketplaceExclusivo;
