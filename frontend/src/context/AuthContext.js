import { createContext, useContext, useState, useEffect } from "react";
import { getToken, getUserRole, getUsername, clearToken, isTokenExpired } from "../utils/jwt";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken]     = useState(getToken);
  const [role, setRole]       = useState(getUserRole);
  const [username, setUsername] = useState(getUsername);

  useEffect(() => {
    if (token && isTokenExpired()) {
      logout();
    }
  }, []);

  const login = (newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    setRole(getUserRole());
    setUsername(getUsername());
  };

  const logout = () => {
    clearToken();
    setToken(null);
    setRole(null);
    setUsername(null);
  };

  return (
    <AuthContext.Provider value={{ token, role, username, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);