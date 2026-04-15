import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import * as authApi from "../api/auth";
import type { UserCreate } from "../types";

interface AuthContextValue {
  username: string | null;
  isAuthenticated: boolean;
  login: (data: UserCreate) => Promise<void>;
  register: (data: UserCreate) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [username, setUsername] = useState<string | null>(
    () => localStorage.getItem("username"),
  );

  const login = useCallback(async (data: UserCreate) => {
    const res = await authApi.login(data);
    localStorage.setItem("token", res.data.access_token);
    localStorage.setItem("username", res.data.username);
    setUsername(res.data.username);
  }, []);

  const register = useCallback(async (data: UserCreate) => {
    await authApi.register(data);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setUsername(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ username, isAuthenticated: !!username, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
