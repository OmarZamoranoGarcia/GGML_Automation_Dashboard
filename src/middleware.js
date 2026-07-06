import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

/**
 * ===============================
 * CONFIGURACIÓN DE RUTAS Y ROLES
 * Formato: "ruta": ["rol1", "rol2"]
 */

const ROUTE_PERMISSIONS = {
  "/dashboard": ["admin"],
  "/example": ["user"],
};

function normalizeRole(role) {
  return String(role || "").toLowerCase();
}

function hasAccess(path, role) {
  const allowedRoles = ROUTE_PERMISSIONS[path];

  if (!allowedRoles) return true;

  return allowedRoles.includes(normalizeRole(role));
}

function getUserFromToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

function getRedirectPath(role) {
  return normalizeRole(role) === "admin" ? "/dashboard" : "/";
}

export function middleware(request) {
  const token = request.cookies.get("access_token")?.value;
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  const PUBLIC_ROUTES = ["/", "/login", "/auth/login"];

  if (PUBLIC_ROUTES.includes(pathname)) {
    if (token) {
      try {
        const decoded = getUserFromToken(token);
        return NextResponse.redirect(new URL(getRedirectPath(decoded.role), request.url));
      } catch {
        return NextResponse.next();
      }
    }

    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const decoded = getUserFromToken(token);
    const role = decoded.role;

    if (!hasAccess(pathname, role)) {
      return NextResponse.redirect(new URL("/403", request.url));
    }

    return NextResponse.next();
  } catch (error) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};