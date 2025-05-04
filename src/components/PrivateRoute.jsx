import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function PrivateRoute({ children }) {
  const { user } = useAuth();

  if (!user) {
    // Redirige al inicio de sesión si no hay usuario autenticado
    return <Navigate to="/" replace />;
  }

  return children; // Renderiza el contenido protegido
}
