import { NextResponse } from "next/server";
import { validateLogin } from "@/app/(auth)/validators/login.validator";
import { login } from "@/app/(auth)/auth.service";

function getRedirectPath(role) {
  const normalizedRole = String(role || "").toLowerCase();

  if (normalizedRole === "admin") {
    return "/dashboard";
  }

  return "/";
}

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

    const result = await login(body);

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

    response.cookies.set("access_token", result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 15,
    });

    response.cookies.set("refresh_token", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

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