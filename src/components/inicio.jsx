import React, { useRef, useState } from "react";
import "bulma/css/bulma.min.css";

function Inicio() {
  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);
  const [isRegistering, setIsRegistering] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isRegistering) {
      if (passwordRef.current.value !== confirmPasswordRef.current.value) {
        alert("Password no coincide");
        return;
      }
      console.log(
        "Registrando usuario:",
        "Nombre:", nameRef.current.value,
        "Email:", emailRef.current.value,
        "Password:", passwordRef.current.value
      );
    } else {
      console.log("Logging in User:", emailRef.current.value, "Password:", passwordRef.current.value);
    }
  };



  return (
    <div className="hero is-flex is-align-items-center">
      <div className="container is-flex is-justify-content-center">
        <div className="box" style={{ width: "400px" }}>
          <h1 className="title has-text-centered">{isRegistering ? "Registro" : "Inicio sesión"}</h1>
          <form onSubmit={handleSubmit}>
            {isRegistering && (
              <div className="field">
                <label className="label">Nombre completo</label>
                <div className="control">
                  <input
                    className="input"
                    type="text"
                    placeholder="e.g. John Doe"
                    ref={nameRef}
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
                  placeholder="ejemplo usuario@example.com"
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
                <label className="label">Confirme Password</label>
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
            <button className="button is-text" onClick={() => setIsRegistering(!isRegistering)}>
              {isRegistering ? "Ya tiene una cuenta?, inicie sesión" : "No esta registrado? Registrese"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inicio