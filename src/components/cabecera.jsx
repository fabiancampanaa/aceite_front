import React from "react";
import { useNavigate } from "react-router-dom";

function Cabecera() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Lógica de cierre de sesión, como eliminar token o limpiar datos
    localStorage.removeItem("token"); // Ejemplo de eliminar el token del localStorage
    navigate("/aplicacion"); // Redirige al login después de cerrar sesión
  };

  return (
    <header className="hero is-dark">
      <div className="hero-head">
        <div className="container">
          <div className="columns is-vcentered is-desktop">
            {/* Logo a la izquierda */}
            <div className="column is-narrow">
              <figure className="image is-128x128 is-inline-block">
                <img src="images/logo.png" alt="Logo" />
              </figure>
            </div>
            {/* Título centrado */}
            <div className="column has-text-centered">
              <h1 className="title has-text-white">
                Aceites con denominación de origen
              </h1>
            </div>
            {/* Botón de cerrar sesión a la derecha */}
            <div className="column is-narrow has-text-right">
              <button className="button is-danger" onClick={handleLogout}>
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Cabecera;
