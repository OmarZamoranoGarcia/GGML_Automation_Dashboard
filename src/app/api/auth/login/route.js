import { NextResponse } from "next/server";
import { validateLogin } from "@/app/(auth)/validators/login.validator";
import { login } from "@/app/(auth)/auth.service";
import { setAuthCookies } from "@/app/(auth)/cookies";
import { getRedirectPath } from "@/lib/route-permissions";
import { rateLimit, resetLimit, getClientIp } from "@/lib/rate-limit";

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 5 * 60_000; // 5 minutos

export async function POST(request) {
  try {
    const body = await request.json();

    const validation = validateLogin(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          ok: false,
          message: validation.message,
        },
        {
          status: 400,
        },
      );
    }

    // Rate limit por IP + email para frenar fuerza bruta sin
    // afectar a otros usuarios que compartan la misma IP.
    const ip = getClientIp(request);
    const limitKey = `login:${ip}:${body.email}`;
    const { success, remaining, reset } = rateLimit(limitKey, MAX_ATTEMPTS, WINDOW_MS);

    if (!success) {
      return NextResponse.json(
        {
          ok: false,
          message: "Demasiados intentos. Intenta de nuevo en unos minutos.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil((reset - Date.now()) / 1000)),
          },
        },
      );
    }

    const result = await login(body);

    // Login exitoso: reseteamos el contador de intentos para este ip+email
    resetLimit(limitKey);

    const response = NextResponse.json({
      ok: true,
      message: "Login exitoso",
      redirectTo: getRedirectPath(result.role),
      user: {
        id: result.id,
        email: result.email,
        role: result.role,
      },
    });

    setAuthCookies(response, result.accessToken, result.refreshToken);

    return response;
  } catch (error) {
    const message = error.message || "Error al iniciar sesión";
    const status = message === "Usuario no encontrado." ? 404 : 401;

    return NextResponse.json(
      {
        ok: false,
        message,
      },
      {
        status,
      },
    );
  }
}