"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { login } from "@/app/(auth)/auth.api";
import { validateLogin } from "@/app/(auth)/validators/login.validator";

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validation = validateLogin(formData);
    if (!validation.success) {
      setError(validation.message);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await login(formData);

      if (data?.ok) {
        router.replace(data.redirectTo || "/dashboard");
        router.refresh();
        return;
      }

      setError(data?.message || "No se pudo iniciar sesión.");
    } catch (err) {
      setError(err.message || "No se pudo iniciar sesión.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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
            <div className="rounded-sm border border-[var(--accent)]/30 bg-[var(--bg-input)] px-3 py-2 text-sm text-[var(--accent)]" role="alert">
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