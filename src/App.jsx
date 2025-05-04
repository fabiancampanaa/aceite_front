import { Routes, Route, useLocation } from "react-router-dom";
import Cabecera from "./components/cabecera";
import Footer from "./components/footer";
import Inicio from "./pages/Inicio";
import Dashboard from "./pages/dashboard";
import CargarExcel from "./pages/carga_datos";
import GestionUsuarios from "./pages/control_usuarios";
import { PrivateRoute } from "./components/PrivateRoute";

function App() {
  const location = useLocation();

  // Solo mostramos Cabecera y Footer si no estamos en la ruta de inicio "/"
  const isAuthPage = location.pathname === "/";

  return (
    <div className="hero is-fullheight">
      {!isAuthPage && <Cabecera />}

      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/cargar_datos"
          element={
            <PrivateRoute>
              <CargarExcel />
            </PrivateRoute>
          }
        />
        <Route
          path="/gestion_usuarios"
          element={
            <PrivateRoute>
              <GestionUsuarios />
            </PrivateRoute>
          }
        />
      </Routes>

      {!isAuthPage && <Footer />}
    </div>
  );
}

export default App;
