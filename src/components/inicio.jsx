import React, { useRef, useState } from "react";
import axios from "axios";
import "bulma/css/bulma.min.css";
import { useNavigate } from "react-router";

function Inicio() {
  let navigate = useNavigate();
  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const numberRef = useRef(null);
  const empresaRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (isRegistering) {
      if (passwordRef.current.value !== confirmPasswordRef.current.value) {
        setError("Constraseñas no coinciden");
        return;
      }

      try {
        const datos_usuario = {
          username: nameRef.current.value,
          email: emailRef.current.value,
          password: passwordRef.current.value,
        };
        const datos_envio = {
          username: nameRef.current.value,
          email: emailRef.current.value,
          password: passwordRef.current.value,
          numero_telefono: numberRef.current.value,
          nombre_empresa: empresaRef.current.value,
        };
        const response = await axios.post(
          "http://localhost:8000/api/register/",
          datos_envio
        );
        setIsRegistering(!isRegistering);
        console.log("Usuario registrado:", response.data);
        setMessage("Usuario Registrado");
        passwordRef.current.value = "";
      } catch (err) {
        setError("Fallo el registro. Por favor intente nuevamente.");
      }
    } else {
      try {
        const response = await axios.post("http://localhost:8000/api/login/", {
          email: emailRef.current.value,
          password: passwordRef.current.value,
        });
        console.log("Usuario Logeado:", response.data);
        navigate("/dashboard");
      } catch (err) {
        setError("Error al iniciar sesion. Porfavor revise sus credenciales.");
      }
    }
  };

  return (
    <div className="hero-body is-flex is-justify-content-center is-align-items-center">
      <div className="box" style={{ width: "450px" }}>
        <h1 className="title has-text-centered">
          {isRegistering ? "Registro" : "Inicio de sesión"}
        </h1>
        {error && <p className="has-text-danger has-text-centered">{error}</p>}
        {message && (
          <p className="has-text-success has-text-centered">{message}</p>
        )}
        <form onSubmit={handleSubmit}>
          {isRegistering && (
            <div className="field">
              <label className="label">Nombre</label>
              <div className="control">
                <input
                  className="input"
                  type="text"
                  placeholder="ejmplo: Juan Perez"
                  ref={nameRef}
                  required
                />
              </div>
            </div>
          )}

          {isRegistering && (
            <div className="field">
              <label className="label">Numero telefonico</label>
              <div className="control">
                <input
                  className="input"
                  type="text"
                  placeholder="Ej: 9xxxxxxxx"
                  ref={numberRef}
                  required
                />
              </div>
            </div>
          )}

          {isRegistering && (
            <div className="field">
              <label className="label">Empresa/Institución</label>
              <div className="control">
                <input
                  className="input"
                  type="text"
                  placeholder="Ej: ACME"
                  ref={empresaRef}
                  required
                />
              </div>
            </div>
          )}

          <div className="field">
            <label className="label">Email</label>
            <div className="control">
              <input
                className="input"
                type="email"
                placeholder="Ejemplo usuario@ejemplo.com"
                ref={emailRef}
                required
              />
            </div>
          </div>

          <div className="field">
            <label className="label">Password</label>
            <div className="control">
              <input
                className="input"
                type="password"
                placeholder="********"
                ref={passwordRef}
                required
              />
            </div>
          </div>

          {isRegistering && (
            <div className="field">
              <label className="label">Confirme Contraseña</label>
              <div className="control">
                <input
                  className="input"
                  type="password"
                  placeholder="********"
                  ref={confirmPasswordRef}
                  required
                />
              </div>
            </div>
          )}

          <div className="field">
            <button className="button is-primary is-fullwidth" type="submit">
              {isRegistering ? "Registro" : "Inicio"}
            </button>
          </div>
        </form>
        <div className="has-text-centered">
          <button
            className="button is-text"
            onClick={() => setIsRegistering(!isRegistering)}
          >
            {isRegistering
              ? "Tiene cuenta? Ingrese"
              : "No tiene Cuenta? Registrese"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Inicio;
