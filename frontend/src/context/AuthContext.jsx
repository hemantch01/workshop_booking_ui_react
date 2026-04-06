import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { api } from "../lib/api";
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const fetchUser = useCallback(async () => {
    try { const data = await api.get("/auth/me/"); setUser(data); }
    catch { setUser(null); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { fetchUser(); }, [fetchUser]);
  const login = async (username, password) => {
    const data = await api.post("/auth/login/", { username, password });
    setUser(data.user); return data;
  };
  const logout = async () => { await api.post("/auth/logout/", {}); setUser(null); };
  const register = async (formData) => { return await api.post("/auth/register/", formData); };
  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register, fetchUser, isInstructor: user?.profile?.position === "instructor", isCoordinator: user?.profile?.position === "coordinator" }}>
      {children}
    </AuthContext.Provider>
  );
}
export const useAuth = () => useContext(AuthContext);
