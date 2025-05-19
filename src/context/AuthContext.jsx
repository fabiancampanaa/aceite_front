import { createContext, useContext, useEffect, useState } from "react";
import * as jwtDecode from "jwt-decode"; // Import como namespace para evitar error en Vite

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authToken, setAuthToken] = useState(null);

  const logout = () => {
    setUser(null);
    setAuthToken(null);
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
  };

  const validateToken = (token) => {
    try {
      const parts = token.split(".");
      if (parts.length !== 3) {
        throw new Error("El token no tiene el formato JWT esperado");
      }

      const decodeFn = jwtDecode.default || jwtDecode;
      const decoded = decodeFn(token);

      if (decoded.exp * 1000 < Date.now()) {
        console.warn("Token expirado");
        logout();
      }
    } catch (e) {
      console.error("Token inválido:", e.message);
      logout();
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const userData = localStorage.getItem("user");

    if (token && token !== "undefined" && token.trim() !== "" && userData) {
      validateToken(token);
      setAuthToken(token);
      setUser(JSON.parse(userData));
    }
  }, []);

  const login = (userData, token) => {
    setUser(userData);
    setAuthToken(token);
    localStorage.setItem("authToken", token);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  return (
    <AuthContext.Provider value={{ user, authToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
