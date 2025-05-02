import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function GestionUsuarios() {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [tipoAcceso, setTipoAcceso] = useState("");
  const navigate = useNavigate();

  const fetchData = () => {
    const token = localStorage.getItem("authToken");

    axios
      .get("http://127.0.0.1:8000/api/v1/users/", {
        headers: {
          Authorization: `Token ${token}`,
        },
      })
      .then((response) => {
        setData(response.data);
      })
      .catch((error) => {
        if (error.response && error.response.status === 401) {
          localStorage.removeItem("authToken");
          navigate("/");
        } else {
          setError(
            "No se pudieron cargar los datos. Por favor intenta nuevamente."
          );
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    navigate("/");
  };

  const openEditModal = (user) => {
    console.log(user.id);
    setSelectedUser(user);
    setTipoAcceso(user.tipo_acceso || "");
  };

  const closeModal = () => {
    setSelectedUser(null);
    setTipoAcceso("");
  };

  const handleSubmit = () => {
    if (!selectedUser) return;
    console.log("Usuario seleccionado:", selectedUser); // 👈 Verifica esto
    const token = localStorage.getItem("authToken");

    axios
      .patch(
        `http://127.0.0.1:8000/api/v1/users/${selectedUser.id}/`,
        { tipo_acceso: tipoAcceso },
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      )
      .then(() => {
        fetchData(); // Refresca la tabla
        closeModal();
      })
      .catch(() => {
        alert("Error al actualizar el usuario.");
      });
  };

  return (
    <div className="section">
      <div className="container">
        <div className="level">
          <div className="level-left">
            <h1 className="title is-3">Gestión de usuarios</h1>
          </div>
          <div className="level-right">
            <button
              className="button is-danger is-small"
              onClick={handleLogout}
            >
              Cerrar sesión
            </button>
          </div>
        </div>

        {loading && <p>Cargando...</p>}
        {error && <div className="notification is-danger">{error}</div>}

        {!loading && !error && (
          <table className="table is-striped is-hoverable is-fullwidth">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Email</th>
                <th>Tipo de acceso</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {data.map((user) => (
                <tr key={user.id}>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>{user.tipo_acceso || "Sin definir"}</td>
                  <td>
                    <button
                      className="button is-warning is-small"
                      onClick={() => openEditModal(user)}
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {selectedUser && (
          <div className="modal is-active">
            <div className="modal-background" onClick={closeModal}></div>
            <div className="modal-card">
              <header className="modal-card-head">
                <p className="modal-card-title">Editar Usuario</p>
                <button
                  className="delete"
                  aria-label="close"
                  onClick={closeModal}
                ></button>
              </header>
              <section className="modal-card-body">
                <div className="field">
                  <label className="label">Usuario</label>
                  <div className="control">
                    <input
                      className="input"
                      type="text"
                      value={selectedUser.username}
                      disabled
                    />
                  </div>
                </div>
                <div className="field">
                  <label className="label">Tipo de acceso</label>
                  <div className="control">
                    <div className="select is-fullwidth">
                      <select
                        value={tipoAcceso}
                        onChange={(e) => setTipoAcceso(e.target.value)}
                      >
                        <option value="">Seleccione</option>
                        <option value="General">General</option>
                        <option value="Exclusivo">Exclusivo</option>
                      </select>
                    </div>
                  </div>
                </div>
              </section>
              <footer className="modal-card-foot">
                <button className="button is-success" onClick={handleSubmit}>
                  Guardar cambios
                </button>
                <button className="button" onClick={closeModal}>
                  Cancelar
                </button>
              </footer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default GestionUsuarios;
