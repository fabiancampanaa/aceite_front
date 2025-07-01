import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const GestionUsuarios = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [tipoAcceso, setTipoAcceso] = useState("");
  const [updating, setUpdating] = useState(false);

  const fetchData = () => {
    const token = localStorage.getItem("authToken");
    axios
      .get("https://aceitesdo.cl/api/v1/users/", {
        headers: {
          Authorization: `Token ${token}`,
        },
      })
      .then((res) => {
        setUsers(res.data);
      })
      .catch((err) => {
        console.error("Error al cargar usuarios:", err);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openModal = (user) => {
    console.log("Usuario seleccionado:", user); // <- agrega este log
    setSelectedUser({
      ...user,
      changePassword: false,
      password: "",
      confirmPassword: "",
    });
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

    if (selectedUser.changePassword) {
      if (!selectedUser.password || !selectedUser.confirmPassword) {
        alert("Debe completar ambos campos de contraseña.");
        return;
      }
      if (selectedUser.password !== selectedUser.confirmPassword) {
        alert("Las contraseñas no coinciden.");
        return;
      }
    }

    const payload = {
      tipo_acceso: tipoAcceso,
    };

    if (selectedUser.changePassword) {
      payload.password = selectedUser.password;
    }

    const token = localStorage.getItem("authToken");
    setUpdating(true);

    axios
      .patch(`https://aceitesdo.cl/api/v1/users/${selectedUser.id}/`, payload, {
        headers: {
          Authorization: `Token ${token}`,
        },
      })
      .then(() => {
        fetchData();
        console.log("Usuario actualizado correctamente");
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
    <div className="container mt-5">
      <h1 className="title">Gestión de Usuarios</h1>
      <table className="table is-fullwidth is-striped">
        <thead>
          <tr>
            <th>Usuario</th>
            <th>Email</th>
            <th>Tipo Acceso</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.username}</td>
              <td>{u.email}</td>
              <td>{u.tipo_acceso || "-"}</td>
              <td>
                <button
                  className="button is-small is-info"
                  onClick={() => openModal(u)}
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

      {/* Modal */}
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

              <div className="field mt-4">
                <label className="checkbox">
                  <input
                    type="checkbox"
                    checked={selectedUser.changePassword}
                    onChange={(e) =>
                      setSelectedUser((prev) => ({
                        ...prev,
                        changePassword: e.target.checked,
                        password: "",
                        confirmPassword: "",
                      }))
                    }
                  />
                  &nbsp; Cambiar contraseña
                </label>
              </div>

              {selectedUser.changePassword && (
                <>
                  <div className="field">
                    <label className="label">Nueva contraseña</label>
                    <div className="control">
                      <input
                        className="input"
                        type="password"
                        value={selectedUser.password}
                        onChange={(e) =>
                          setSelectedUser((prev) => ({
                            ...prev,
                            password: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div className="field">
                    <label className="label">Confirmar contraseña</label>
                    <div className="control">
                      <input
                        className="input"
                        type="password"
                        value={selectedUser.confirmPassword}
                        onChange={(e) =>
                          setSelectedUser((prev) => ({
                            ...prev,
                            confirmPassword: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                </>
              )}
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
  );
};

export default GestionUsuarios;
