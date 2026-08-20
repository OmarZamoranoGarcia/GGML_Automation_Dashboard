"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { login } from "@/app/api/auth";
import { ApiError } from "@/lib/api-client";
import { useAuth } from "@/hooks/auth/AuthContext";

export default function Login() {
  const router = useRouter();
  const { setSession, isAuthenticated, isLoading } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isLoading, isAuthenticated, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setError("Por favor completa todos los campos");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const user = await login(formData.email, formData.password);
      setSession(user);
      router.replace("/dashboard");
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("No se pudo iniciar sesión.");
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 bg-[var(--bg-primary)]">
      <div className="w-full max-w-sm rounded-lg p-8 bg-[var(--bg-panel)] border border-[var(--border-subtle)]">
        <h1 className="text-xl font-semibold mb-1 text-[var(--text-primary)]">
          Iniciar sesión
        </h1>
        <p className="text-sm mb-6 text-[var(--text-secondary)]">
          Ingresa tus credenciales para continuar.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div
              className="rounded-sm border border-[var(--accent)]/30 bg-[var(--bg-input)] px-3 py-2 text-sm text-[var(--accent)]"
              role="alert"
            >
              {error}
            </div>
          )}
          <div>
            <label
              htmlFor="email"
              className="block text-xs mb-1.5 text-[var(--text-muted)]"
            >
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => {
                setFormData({ ...formData, email: e.target.value });
                if (error) setError("");
              }}
              placeholder="tucorreo@ejemplo.com"
              className="w-full px-3 py-2.5 rounded-sm outline-none text-sm bg-[var(--bg-input)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:border-[var(--accent)] transition-colors"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-xs mb-1.5 text-[var(--text-muted)]"
            >
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              required
              value={formData.password}
              onChange={(e) => {
                setFormData({ ...formData, password: e.target.value });
                if (error) setError("");
              }}
              placeholder="••••••••"
              className="w-full px-3 py-2.5 rounded-sm outline-none text-sm bg-[var(--bg-input)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:border-[var(--accent)] transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-sm text-sm font-medium transition-colors disabled:opacity-60 bg-[var(--accent)] text-[var(--bg-primary)] hover:bg-[var(--accent-hover)]"
          >
            {loading ? "Verificando..." : "Ingresar"}
          </button>
        </form>
      </div>
    </div>
  );
}