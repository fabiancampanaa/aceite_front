import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "bulma/css/bulma.min.css";

const CargarExcel = () => {
  const [archivo, setArchivo] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate(); // Utilizamos useNavigate para redirigir al inicio de sesión

  // Función para cerrar sesión
  const handleCerrarSesion = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    navigate("/"); // Redirige al usuario a la página de inicio de sesión
  };

  const handleArchivoChange = (e) => {
    const selectedFile = e.target.files[0];
    setArchivo(selectedFile);
    setError("");
    setMensaje("");

    if (selectedFile && selectedFile.size > 10 * 1024 * 1024) {
      // Limitar el tamaño del archivo a 10MB
      setError("El archivo es demasiado grande. Máximo 10MB.");
      setArchivo(null);
    }
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
      {/* Botón de Cerrar Sesión */}
      <div className="field is-grouped is-pulled-right mb-4">
        <button className="button is-danger" onClick={handleCerrarSesion}>
          Cerrar sesión
        </button>
      </div>

      <h2 className="title is-4">Subir archivo Excel</h2>

      <div className="file has-name is-boxed mb-4">
        <label className="file-label">
          <input
            className="file-input"
            type="file"
            accept=".xlsx, .xls"
            onChange={handleArchivoChange}
            aria-describedby="archivoStatus"
          />
          <span className="file-cta">
            <span className="file-icon">📁</span>
            <span className="file-label">Elegir archivo</span>
          </span>
          <span className="file-name" id="archivoStatus">
            {archivo ? archivo.name : "Ningún archivo seleccionado"}
          </span>
        </label>
      </div>

      <button
        className={`button is-primary ${cargando ? "is-loading" : ""}`}
        onClick={handleEnviar}
        disabled={cargando}
        aria-live="polite"
      >
        Subir
      </button>

      {mensaje && (
        <div className="notification is-success mt-4" aria-live="assertive">
          {mensaje}
        </div>
      )}
      {error && (
        <div className="notification is-danger mt-4" aria-live="assertive">
          {error}
        </div>
      )}
    </div>
  );
};

export default CargarExcel;
