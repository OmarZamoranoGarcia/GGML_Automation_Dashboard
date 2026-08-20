import { apiFetch } from "@/lib/api-client";

export async function login(email, password) {
  const data = await apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
    skipAuthRetry: true, // el login nunca debe intentar refrescar un token que no existe
  });

  return data.user; // el backend no manda tokens en el body para web, solo el user
}

export async function getCurrentUser() {
  const data = await apiFetch("/auth/me", {
    method: "GET",
  });

  return data.user;
}

export async function logout() {
  await apiFetch("/auth/logout", {
    method: "POST",
    skipAuthRetry: true,
  });
}