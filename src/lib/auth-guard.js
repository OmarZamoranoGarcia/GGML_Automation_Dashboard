import { NextResponse } from "next/server";
import { verifyAccessToken } from "@/app/(auth)/jwt";
import { hasAccess } from "@/lib/route-permissions";

/**
 * El matcher de middleware.js excluye deliberadamente "/api" (ver
 * config.matcher) para no interferir con rutas públicas de la API en el
 * futuro. Eso significa que CADA API route sensible debe validar la sesión
 * por sí misma, usando estos helpers.
 */

function unauthorized() {
  return NextResponse.json({ ok: false, error: "No autenticado." }, { status: 401 });
}

function forbidden() {
  return NextResponse.json(
    { ok: false, error: "No tienes permisos para acceder a este recurso." },
    { status: 403 },
  );
}

export function requireAuth(request) {
  const token = request.cookies.get("access_token")?.value;

  if (!token) {
    return { authorized: false, response: unauthorized() };
  }

  try {
    const user = verifyAccessToken(token);
    return { authorized: true, user };
  } catch {
    return { authorized: false, response: unauthorized() };
  }
}

/**
 * @param {Request} request
 * @param {string} routeKey - clave definida en ROUTE_PERMISSIONS (ej. "/dashboard")
 */
export function requireRole(request, routeKey) {
  const auth = requireAuth(request);

  if (!auth.authorized) {
    return auth;
  }

  if (!hasAccess(routeKey, auth.user.role)) {
    return { authorized: false, response: forbidden() };
  }

  return auth;
}
