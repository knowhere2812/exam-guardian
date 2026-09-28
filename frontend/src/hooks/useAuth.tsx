import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Role, User } from "@/data/mockData";
import { authService, type Credentials, type RegisterPayload } from "@/services/authService";

interface AuthState {
  user: User | null;
  ready: boolean;
  login: (c: Credentials) => Promise<User>;
  register: (p: RegisterPayload) => Promise<User>;
  logout: () => void;
  hasRole: (r: Role) => boolean;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;

    if (!authService.getToken()) {
      setUser(null);
      setReady(true);
      return;
    }

    authService
      .currentUser()
      .then((currentUser) => {
        if (!active) return;
        authService.persist(currentUser);
        setUser(currentUser);
      })
      .catch(() => {
        if (!active) return;
        authService.persist(null);
        setUser(null);
      })
      .finally(() => {
        if (active) setReady(true);
      });

    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (c: Credentials) => {
    const u = await authService.login(c);
    authService.persist(u);
    setUser(u);
    return u;
  }, []);

  const register = useCallback(async (p: RegisterPayload) => {
    const u = await authService.register(p);
    authService.persist(u);
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(() => {
    authService.persist(null);
    setUser(null);
  }, []);

  const value = useMemo<AuthState>(
    () => ({ user, ready, login, register, logout, hasRole: (r) => user?.role === r }),
    [user, ready, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
