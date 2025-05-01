import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function GestionUsuarios() {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accessValues, setAccessValues] = useState({});
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
        // Inicializa los valores del tipo de acceso por usuario
        const initial = {};
        response.data.forEach((user) => {
          initial[user.id] = user.tipo_acceso || "";
        });
        setAccessValues(initial);
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

  const handleAccessChange = (userId, value) => {
    setAccessValues((prev) => ({
      ...prev,
      [userId]: value,
    }));
  };

  const updateAccessType = (userId, username) => {
    const token = localStorage.getItem("authToken");
    const tipo_acceso = accessValues[userId];

    axios
      .patch(
        `http://127.0.0.1:8000/api/v1/users/${userId}/`,
        { tipo_acceso },
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      )
      .then(() => {
        alert(`Tipo de acceso actualizado para ${username}`);
      })
      .catch(() => {
        alert(`Error al actualizar el tipo de acceso de ${username}`);
      });
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/"); // Redirige al inicio (puedes cambiar esto a otra ruta si prefieres)
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
                  <td>
                    <div className="select is-small">
                      <select
                        value={accessValues[user.id] ?? ""}
                        onChange={(e) =>
                          handleAccessChange(user.id, e.target.value)
                        }
                      >
                        <option key={`${user.id}-default`} value="">
                          Seleccione
                        </option>
                        {["General", "Exclusivo"].map((tipo) => (
                          <option key={`${user.id}-${tipo}`} value={tipo}>
                            {tipo}
                          </option>
                        ))}
                      </select>
                    </div>
                  </td>
                  <td>
                    <button
                      className="button is-info is-small"
                      onClick={() => updateAccessType(user.id, user.username)}
                    >
                      Actualizar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default GestionUsuarios;
