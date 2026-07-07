import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { hasAccess, getRedirectPath } from "@/lib/route-permissions";

const encodedSecret = new TextEncoder().encode(process.env.JWT_SECRET);

// jsonwebtoken depende del módulo "crypto" de Node y NO funciona en el
// Edge Runtime donde corre el middleware. `jose` usa Web Crypto API,
// compatible con Edge. Las API routes (Node runtime) siguen usando
// jsonwebtoken en src/app/(auth)/jwt.js sin problema.
async function getUserFromToken(token) {
  const { payload } = await jwtVerify(token, encodedSecret);
  return payload;
}

export async function proxy(request) {
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
        const decoded = await getUserFromToken(token);
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
    const decoded = await getUserFromToken(token);

    if (!hasAccess(pathname, decoded.role)) {
      return NextResponse.redirect(new URL("/403", request.url));
    }

    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
