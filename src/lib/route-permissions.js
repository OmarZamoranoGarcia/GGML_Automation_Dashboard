/**
 * Fuente única de verdad para permisos por ruta.
 *
 * Se importa tanto desde `middleware.js` (Edge Runtime, protege páginas)
 * como desde `lib/auth-guard.js` (Node runtime, protege API routes).
 * No depende de ninguna librería de Node ni de Edge: es JS puro,
 * por eso puede correr en ambos entornos sin problema.
 */

export const ROUTE_PERMISSIONS = {
  "/dashboard": ["admin"],
  "/example": ["user"],
};

export function normalizeRole(role) {
  return String(role || "").toLowerCase();
}

export function hasAccess(routeKey, role) {
  const allowedRoles = ROUTE_PERMISSIONS[routeKey];

  if (!allowedRoles) return true;

  return allowedRoles.includes(normalizeRole(role));
}

export function getRedirectPath(role) {
  return normalizeRole(role) === "admin" ? "/dashboard" : "/";
}
