"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/app/(auth)/auth.api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      try {
        const response = await apiFetch("/api/auth/me");

        if (!mounted) {
          return;
        }

        if (!response.ok) {
          setUser(null);
          setLoading(false);
          return;
        }

        const data = await response.json();
        setUser(data.user ?? null);
      } catch (error) {
        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadUser();

    return () => {
      mounted = false;
    };
  }, []);

  const value = useMemo(
    () => ({ user, setUser, loading }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
