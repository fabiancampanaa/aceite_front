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

  const isLikelyJWT = (token) =>
    typeof token === "string" && token.split(".").length === 3;

  const validateToken = (token) => {
    try {
      if (!isLikelyJWT(token)) {
        throw new Error("El token no tiene el formato JWT esperado");
      }

      const decodeFn = jwtDecode.default || jwtDecode;

      let decoded;
      try {
        decoded = decodeFn(token);
      } catch (err) {
        throw new Error("No se pudo decodificar el token");
      }

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

    console.log("Token recuperado:", token); // ✅ Mejora #2

    if (isLikelyJWT(token) && userData) {
      validateToken(token);
      setAuthToken(token);
      setUser(JSON.parse(userData));
    } else {
      logout(); // ✅ Limpia localStorage si es inválido
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
