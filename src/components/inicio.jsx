import React, { useRef, useState } from "react";
import axios from "axios";
import "bulma/css/bulma.min.css";
import { useNavigate } from "react-router-dom";

function Inicio() {
  const navigate = useNavigate();
  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const numberRef = useRef(null);
  const empresaRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);

  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (isRegistering) {
        // ... código de registro ...
      } else {
        const response = await axios.post("http://localhost:8000/api/login/", {
          email: emailRef.current.value,
          password: passwordRef.current.value,
        });

        // Verifica la respuesta del servidor
        if (!response.data.token) {
          throw new Error("No se recibió token de autenticación");
        }

        localStorage.setItem("authToken", response.data.token);

        // Redirige programáticamente
        navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      console.error("Error en autenticación:", err);
      setError(
        err.response?.data?.message ||
          "Error al iniciar sesión. Verifique sus credenciales."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    emailRef.current.value = "";
    passwordRef.current.value = "";
    if (confirmPasswordRef.current) confirmPasswordRef.current.value = "";
  };

  return (
    <section className="hero is-fullheight">
      <div className="hero-body is-flex is-justify-content-center is-align-items-center">
        <div className="box" style={{ width: "450px", position: "relative" }}>
          {/* Notificación de éxito */}
          {showSuccess && (
            <div className="notification is-success is-light has-text-centered">
              <button
                className="delete"
                onClick={() => setShowSuccess(false)}
              ></button>
              <p className="title is-4">¡Registro exitoso!</p>
              <p className="subtitle is-6">
                Ahora puedes iniciar sesión con tus credenciales
              </p>
            </div>
          )}

          <h1 className="title has-text-centered">
            {isRegistering ? "Registro" : "Inicio de sesión"}
          </h1>

          {error && (
            <div className="notification is-danger is-light">
              <button className="delete" onClick={() => setError("")}></button>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {isRegistering && (
              <>
                <div className="field">
                  <label className="label">Nombre</label>
                  <div className="control has-icons-left">
                    <input
                      className="input"
                      type="text"
                      placeholder="Ej: Juan Pérez"
                      ref={nameRef}
                      required
                    />
                    <span className="icon is-small is-left">
                      <i className="fas fa-user"></i>
                    </span>
                  </div>
                </div>

                <div className="field">
                  <label className="label">Teléfono</label>
                  <div className="control has-icons-left">
                    <input
                      className="input"
                      type="tel"
                      placeholder="Ej: 912345678"
                      ref={numberRef}
                      required
                    />
                    <span className="icon is-small is-left">
                      <i className="fas fa-phone"></i>
                    </span>
                  </div>
                </div>

                <div className="field">
                  <label className="label">Empresa</label>
                  <div className="control has-icons-left">
                    <input
                      className="input"
                      type="text"
                      placeholder="Ej: Mi Empresa S.A."
                      ref={empresaRef}
                      required
                    />
                    <span className="icon is-small is-left">
                      <i className="fas fa-building"></i>
                    </span>
                  </div>
                </div>
              </>
            )}

            <div className="field">
              <label className="label">Email</label>
              <div className="control has-icons-left">
                <input
                  className="input"
                  type="email"
                  placeholder="usuario@ejemplo.com"
                  ref={emailRef}
                  required
                />
                <span className="icon is-small is-left">
                  <i className="fas fa-envelope"></i>
                </span>
              </div>
            </div>

            <div className="field">
              <label className="label">Contraseña</label>
              <div className="control has-icons-left">
                <input
                  className="input"
                  type="password"
                  placeholder="••••••••"
                  ref={passwordRef}
                  required
                  minLength="6"
                />
                <span className="icon is-small is-left">
                  <i className="fas fa-lock"></i>
                </span>
              </div>
            </div>

            {isRegistering && (
              <div className="field">
                <label className="label">Confirmar Contraseña</label>
                <div className="control has-icons-left">
                  <input
                    className="input"
                    type="password"
                    placeholder="••••••••"
                    ref={confirmPasswordRef}
                    required
                    minLength="6"
                  />
                  <span className="icon is-small is-left">
                    <i className="fas fa-lock"></i>
                  </span>
                </div>
              </div>
            )}

            <div className="field mt-5">
              <button
                className={`button is-primary is-fullwidth ${
                  isLoading ? "is-loading" : ""
                }`}
                type="submit"
                disabled={isLoading}
              >
                {isRegistering ? "Registrarse" : "Iniciar sesión"}
              </button>
            </div>
          </form>

          <div className="has-text-centered mt-3">
            <button
              className="button is-text"
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError("");
              }}
              disabled={isLoading}
            >
              {isRegistering
                ? "¿Ya tienes cuenta? Inicia sesión"
                : "¿No tienes cuenta? Regístrate"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Inicio;
