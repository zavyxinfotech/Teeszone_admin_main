"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { ApiError, authApi, setAuthToken } from "@/lib/api";
import type { AuthUser } from "@/lib/types";

// Admin session: 7-day backend JWT in localStorage, profile re-fetched from
// /auth/me on every load (mirrors ui/src/lib/auth.tsx). Only ADMIN users are
// accepted — the API enforces this too (403), this just keeps the UX honest.

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);
const STORAGE_KEY = "teeszone-admin-auth-v1";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    let cancelled = false;
    let stored: string | null = null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      stored = raw ? ((JSON.parse(raw) as { token?: string }).token ?? null) : null;
    } catch {
      stored = null;
    }
    if (!stored) {
      setReady(true);
      return;
    }
    authApi
      .me(stored)
      .then((profile) => {
        if (cancelled) return;
        if (profile.role !== "ADMIN") throw new Error("not admin");
        setAuthToken(stored);
        setToken(stored);
        setUser(profile);
      })
      .catch(() => {
        if (!cancelled) localStorage.removeItem(STORAGE_KEY);
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const login = useCallback(async (email: string, password: string) => {
    const session = await authApi.login({ email, password });
    if (session.user.role !== "ADMIN") {
      throw new ApiError(
        "This account isn't an admin.",
        403,
        "Ask Madhan to add your email to ADMIN_EMAILS, then sign in again.",
      );
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ token: session.token }));
    setAuthToken(session.token);
    setToken(session.token);
    setUser(session.user);
    return session.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setAuthToken(null);
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, token, ready, login, logout }), [user, token, ready, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

// Redirects to /login (with return path) once the session check finishes
// without an admin user.
export function useRequireAdmin() {
  const { user, token, ready } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  useEffect(() => {
    if (ready && !user) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [ready, user, router, pathname]);
  return { user, token, ready };
}
