import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { User } from "../types/api";
import { ApiError } from "../services/api";
import { getMe, logout as logoutRequest } from "../services/auth";

interface AuthContextValue {
  user: User | null;
  ready: boolean;
  bootstrapError: string | null;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [bootstrapError, setBootstrapError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const next = await getMe();
      setUser(next);
      setBootstrapError(null);
    } catch (err) {
      setUser(null);
      if (err instanceof ApiError && err.status === 401) {
        setBootstrapError(null);
        return;
      }
      const message =
        err instanceof Error ? err.message : "Unable to verify session";
      setBootstrapError(message);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await refresh();
      if (!cancelled) setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [refresh]);

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({ user, ready, bootstrapError, refresh, logout }),
    [user, ready, bootstrapError, refresh, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
