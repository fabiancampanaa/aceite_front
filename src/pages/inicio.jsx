import React, { useRef, useState } from "react";
import axios from "axios";
import "bulma/css/bulma.min.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Inicio() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const numberRef = useRef(null);
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
        if (passwordRef.current.value.length < 6) {
          setError("La contraseña debe tener al menos 6 caracteres");
          return;
        }

        if (passwordRef.current.value !== confirmPasswordRef.current.value) {
          setError("Las contraseñas no coinciden");
          return;
        }

        const userData = {
          username: nameRef.current.value,
          email: emailRef.current.value,
          password: passwordRef.current.value,
          numero_telefono: numberRef.current.value,
        };

        const response = await axios.post(
          "https://aceitesdo.cl/api/register",
          userData
        );

        const { token, user } = response.data;
        login(user, token);
        setShowSuccess(true);
      } else {
        const response = await axios.post("https://aceitesdo.cl/api/login", {
          email: emailRef.current.value,
          password: passwordRef.current.value,
        });

        if (!response.data.token) {
          throw new Error("No se recibió token de autenticación");
        }

        const { token, user } = response.data;
        login(user, token);
        console.log("usuario registrado");

        const tipoUsuario = user.tipo_usuario;

        switch (tipoUsuario) {
          case "admin":
            navigate("/gestion_usuarios");
            break;
          case "superadmin":
            navigate("/cargar_datos");
            break;
          case "basico":
            navigate("/dashboard");
            break;
          default:
            console.warn("Tipo de usuario desconocido:", tipoUsuario);
            navigate("/aplicacion", { replace: true });
        }
      }
    } catch (err) {
      console.error(
        "Error en autenticación:",
        err.response?.data || err.message
      );

      if (err.response) {
        const status = err.response.status;
        const data = err.response.data;

        if (status === 409) {
          // Registro duplicado
          if (data.username) {
            setError("El nombre de usuario ya está registrado.");
          } else if (data.email) {
            setError("El correo ya está registrado.");
          } else {
            setError("Conflicto: Verifica tus datos.");
          }
        } else if (status === 400) {
          // Errores de validación del backend
          const messages = Object.entries(data)
            .map(([campo, errores]) => `${campo}: ${errores.join(", ")}`)
            .join("\n");
          setError(messages);
        } else if (status === 401) {
          setError("Credenciales inválidas. Verifica tu correo y contraseña.");
        } else {
          setError("Error del servidor: " + (data.message || status));
        }
      } else {
        setError("Error de red o del servidor. Inténtalo más tarde.");
      }
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
