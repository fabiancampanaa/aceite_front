import { createContext, useContext, useEffect, useState } from "react";

import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authToken, setAuthToken] = useState(null);

  // Función para validar el token
  const validateToken = (token) => {
    try {
      const decoded = jwtDecode(token); // Decodificar el token
      if (decoded.exp * 1000 < Date.now()) {
        logout(); // Si el token ha expirado, hacer logout
      }
    } catch (e) {
      console.error("Token inválido", e);
      logout(); // Si el token no es decodificable, hacer logout
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const userData = localStorage.getItem("user");
    if (token && userData) {
      validateToken(token); // Validar el token al cargar
      setAuthToken(token);
      setUser(JSON.parse(userData));
    }
  }, []);

  // Login
  const login = (userData, token) => {
    setUser(userData);
    setAuthToken(token);
    localStorage.setItem("authToken", token);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  // Logout
  const logout = () => {
    setUser(null);
    setAuthToken(null);
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, authToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
