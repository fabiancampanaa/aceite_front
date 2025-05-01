import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"; // Importa Navigate
import App from "./App.jsx";
import Dashboard from "./components/dashboard.jsx";
import CargarExcel from "./components/carga_datos.jsx";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <StrictMode>
      <Routes>
        <Route path="/" element={<App />} />
        <Route
          path="/dashboard"
          element={
            localStorage.getItem("authToken") ? (
              <Dashboard />
            ) : (
              <Navigate to="/" replace /> // Añade replace para mejor manejo de historial
            )
          }
        />
        <Route
          path="/cargar_datos"
          element={
            localStorage.getItem("authToken") ? (
              <CargarExcel />
            ) : (
              <Navigate to="/" replace /> // Añade replace para mejor manejo de historial
            )
          }
        />
      </Routes>
    </StrictMode>
  </BrowserRouter>
);
