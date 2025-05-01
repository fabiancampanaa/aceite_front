import React, { useState } from "react";
import "bulma/css/bulma.min.css";

const CargarExcel = () => {
  const [archivo, setArchivo] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const handleArchivoChange = (e) => {
    setArchivo(e.target.files[0]);
    setError("");
    setMensaje("");
  };

  const handleEnviar = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("No se encontró el token de autenticación.");
      return;
    }

    if (!archivo) {
      setError("Por favor selecciona un archivo.");
      return;
    }

    const tipoValido = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];
    if (!tipoValido.includes(archivo.type)) {
      setError("Tipo de archivo no válido. Solo .xls o .xlsx.");
      return;
    }

    const formData = new FormData();
    formData.append("archivo", archivo);

    setCargando(true);
    try {
      const respuesta = await fetch("http://localhost:8000/api/cargar-excel/", {
        method: "POST",
        headers: {
          Authorization: `Token ${token}`,
        },
        body: formData,
      });

      const data = await respuesta.json();

      if (respuesta.ok) {
        setMensaje(data.mensaje || "Archivo cargado correctamente.");
        setError("");
        setArchivo(null);
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
      <h2 className="title is-4">Subir archivo Excel</h2>

      <div className="file has-name is-boxed mb-4">
        <label className="file-label">
          <input
            className="file-input"
            type="file"
            accept=".xlsx, .xls"
            onChange={handleArchivoChange}
          />
          <span className="file-cta">
            <span className="file-icon">📁</span>
            <span className="file-label">Elegir archivo</span>
          </span>
          <span className="file-name">
            {archivo ? archivo.name : "Ningún archivo seleccionado"}
          </span>
        </label>
      </div>

      <button
        className={`button is-primary ${cargando ? "is-loading" : ""}`}
        onClick={handleEnviar}
        disabled={cargando}
      >
        Subir
      </button>

      {mensaje && <div className="notification is-success mt-4">{mensaje}</div>}
      {error && <div className="notification is-danger mt-4">{error}</div>}
    </div>
  );
};

export default CargarExcel;
