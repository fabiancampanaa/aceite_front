import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

function GestionUsuarios() {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [tipoAcceso, setTipoAcceso] = useState("");
  const [updating, setUpdating] = useState(false);
  const navigate = useNavigate();

  const fetchData = () => {
    const token = localStorage.getItem("authToken");

    axios
      .get("https://aceitesdo.cl/api/v1/users", {
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

  const openEditModal = (user) => {
    setSelectedUser(user);
    setTipoAcceso(user.tipo_acceso || "");
  };

  const closeModal = () => {
    setSelectedUser(null);
    setTipoAcceso("");
  };

  const handleSubmit = () => {
    if (!selectedUser) return;
    if (!tipoAcceso) {
      alert("Debe seleccionar un tipo de acceso.");
      return;
    }
    if (selectedUser.tipo_acceso === tipoAcceso) {
      closeModal();
      return;
    }

    const token = localStorage.getItem("authToken");
    setUpdating(true);

    axios
      .patch(
        `https://aceitesdo.cl/api/v1/users/${selectedUser.id}/`,
        { tipo_acceso: tipoAcceso },
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      )
      .then(() => {
        fetchData();
        closeModal();
      })
      .catch(() => {
        alert("Error al actualizar el usuario.");
      })
      .finally(() => setUpdating(false));
  };

  const descargarExcel = () => {
    const token = localStorage.getItem("authToken");

    axios
      .get("https://aceitesdo.cl/api/v1/busquedas/", {
        headers: {
          Authorization: `Token ${token}`,
        },
      })
      .then((response) => {
        exportarExcel(response.data, "busquedas.xlsx", "Busquedas");
      })
      .catch((error) => {
        console.error(error);
        alert("No se pudo descargar el archivo de búsquedas.");
      });
  };

  const descargarExcelRRSS = () => {
    const token = localStorage.getItem("authToken");

    axios
      .get("https://aceitesdo.cl/api/v1/busquedasrrss/", {
        headers: {
          Authorization: `Token ${token}`,
        },
      })
      .then((response) => {
        exportarExcel(response.data, "busquedas_rrss.xlsx", "RRSS");
      })
      .catch((error) => {
        console.error(error);
        alert("No se pudo descargar el archivo de búsquedas RRSS.");
      });
  };

  const exportarExcel = (data, nombreArchivo, nombreHoja) => {
    if (!Array.isArray(data)) {
      alert("Formato de datos inválido para exportación.");
      return;
    }

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, nombreHoja);

    const excelBuffer = XLSX.write(wb, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(blob, nombreArchivo);
  };

  return (
    <div className="section">
      <div className="container">
        <div className="level">
          <div className="level-left">
            <h1 className="title is-3">Gestión de usuarios</h1>
          </div>
        </div>

        {loading && <p>Cargando...</p>}
        {error && <div className="notification is-danger">{error}</div>}

        {!loading && !error && (
          <>
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

            <div className="buttons is-right mt-4">
              <button className="button is-link" onClick={descargarExcel}>
                Descargar búsquedas en Excel
              </button>
              <button className="button is-info" onClick={descargarExcelRRSS}>
                Descargar búsquedas RRSS en Excel
              </button>
            </div>
          </>
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
                <button
                  className="button is-success"
                  onClick={handleSubmit}
                  disabled={updating}
                >
                  {updating ? "Guardando..." : "Guardar cambios"}
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
