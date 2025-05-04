import React, { useState, useRef } from "react";
import "bulma/css/bulma.min.css";

const CargarExcel = () => {
  const [archivo1, setArchivo1] = useState(null);
  const [archivo2, setArchivo2] = useState(null);
  const [mensaje1, setMensaje1] = useState("");
  const [mensaje2, setMensaje2] = useState("");
  const [error1, setError1] = useState("");
  const [error2, setError2] = useState("");
  const [cargando1, setCargando1] = useState(false);
  const [cargando2, setCargando2] = useState(false);

  const input1Ref = useRef(null);
  const input2Ref = useRef(null);

  const tipoValido = [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
  ];

  const handleArchivoChange = (e, setArchivo, setError, setMensaje) => {
    const file = e.target.files[0];
    if (file && !tipoValido.includes(file.type)) {
      setError("Tipo de archivo no válido. Solo .xls o .xlsx.");
      setMensaje("");
      return;
    }
    setArchivo(file);
    setError("");
    setMensaje("");
  };

  const subirArchivo = async (
    archivo,
    setCargando,
    setMensaje,
    setError,
    inputRef,
    nombreCampo
  ) => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("No se encontró el token de autenticación.");
      return;
    }

    if (!archivo) {
      setError("Por favor selecciona un archivo.");
      return;
    }

    const formData = new FormData();
    formData.append(nombreCampo, archivo);

    setCargando(true);
    try {
      const respuesta = await fetch(
        `http://localhost:8000/api/${nombreCampo}/`,
        {
          method: "POST",
          headers: {
            Authorization: `Token ${token}`,
          },
          body: formData,
        }
      );

      const data = await respuesta.json();

      if (respuesta.ok) {
        setMensaje(data.mensaje || "Archivo cargado correctamente.");
        setError("");
        if (inputRef.current) inputRef.current.value = null;
      } else {
        setError(data.error || "Ocurrió un error.");
        setMensaje("");
      }
    } catch (err) {
      setError("Error de red o del servidor.");
      setMensaje("");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="title is-4">Cargar archivos extracción BOT</h2>

      {/* Archivo 1 */}
      <div className="box">
        <p className="subtitle is-6">Archivo Busquedas</p>
        <div className="file has-name is-boxed mb-2">
          <label className="file-label">
            <input
              ref={input1Ref}
              className="file-input"
              type="file"
              accept=".xlsx, .xls"
              onChange={(e) =>
                handleArchivoChange(e, setArchivo1, setError1, setMensaje1)
              }
            />
            <span className="file-cta">
              <span className="file-icon">📁</span>
              <span className="file-label">Elegir archivo</span>
            </span>
            <span className="file-name">
              {archivo1 ? archivo1.name : "Ningún archivo seleccionado"}
            </span>
          </label>
        </div>
        <button
          className={`button is-link ${cargando1 ? "is-loading" : ""}`}
          onClick={() =>
            subirArchivo(
              archivo1,
              setCargando1,
              setMensaje1,
              setError1,
              input1Ref,
              "archivo1"
            )
          }
          disabled={cargando1}
        >
          Subir archivo busquedas
        </button>
        {mensaje1 && (
          <div className="notification is-success mt-3">{mensaje1}</div>
        )}
        {error1 && <div className="notification is-danger mt-3">{error1}</div>}
      </div>

      {/* Archivo 2 */}
      <div className="box">
        <p className="subtitle is-6">Archivo RRSS</p>
        <div className="file has-name is-boxed mb-2">
          <label className="file-label">
            <input
              ref={input2Ref}
              className="file-input"
              type="file"
              accept=".xlsx, .xls"
              onChange={(e) =>
                handleArchivoChange(e, setArchivo2, setError2, setMensaje2)
              }
            />
            <span className="file-cta">
              <span className="file-icon">📁</span>
              <span className="file-label">Elegir archivo</span>
            </span>
            <span className="file-name">
              {archivo2 ? archivo2.name : "Ningún archivo seleccionado"}
            </span>
          </label>
        </div>
        <button
          className={`button is-info ${cargando2 ? "is-loading" : ""}`}
          onClick={() =>
            subirArchivo(
              archivo2,
              setCargando2,
              setMensaje2,
              setError2,
              input2Ref,
              "archivo2"
            )
          }
          disabled={cargando2}
        >
          Subir archivo RRSS
        </button>
        {mensaje2 && (
          <div className="notification is-success mt-3">{mensaje2}</div>
        )}
        {error2 && <div className="notification is-danger mt-3">{error2}</div>}
      </div>
    </div>
  );
};

export default CargarExcel;
