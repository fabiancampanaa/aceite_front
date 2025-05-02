import React, { useState } from "react";

function CargarExcel() {
  const [archivo, setArchivo] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));
  console.log(user);

  const handleCerrarSesion = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  const handleArchivoChange = (e) => {
    setArchivo(e.target.files[0]);
    setMensaje("");
    setError("");
  };

  const handleEnviar = () => {
    if (!archivo) {
      setError("Debes seleccionar un archivo.");
      return;
    }

    setCargando(true);
    setMensaje("");
    setError("");

    // Aquí va tu lógica para subir el archivo
    setTimeout(() => {
      setMensaje("Archivo subido correctamente.");
      setCargando(false);
    }, 2000);
  };

  return (
    <>
      {/* NAVBAR */}
      <nav
        className="navbar is-primary"
        role="navigation"
        aria-label="main navigation"
      >
        <div className="navbar-brand">
          <span className="navbar-item has-text-weight-semibold">
            Bienvenido, {user.username}
          </span>
        </div>
        <div className="navbar-end pr-4">
          <div className="navbar-item">
            <button className="button is-danger" onClick={handleCerrarSesion}>
              Cerrar sesión
            </button>
          </div>
        </div>
      </nav>

      {/* FORMULARIO CENTRADO */}
      <div className="section">
        <div className="container">
          <div className="box" style={{ maxWidth: "500px", margin: "0 auto" }}>
            <h2 className="title is-3 has-text-centered">
              Carga de datos a BD
            </h2>

            <div className="file has-name is-boxed is-fullwidth mb-5">
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

            <div className="has-text-centered">
              <button
                className={`button is-primary ${cargando ? "is-loading" : ""}`}
                onClick={handleEnviar}
                disabled={cargando}
              >
                Subir
              </button>
            </div>

            {mensaje && (
              <div className="notification is-success mt-4">{mensaje}</div>
            )}
            {error && (
              <div className="notification is-danger mt-4">{error}</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default CargarExcel;
