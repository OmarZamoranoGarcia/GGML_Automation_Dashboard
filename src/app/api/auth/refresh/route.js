import { NextResponse } from "next/server";
import { verifyRefreshToken, generateAccessToken } from "@/app/(auth)/jwt";
import { setAccessCookie } from "@/app/(auth)/cookies";
import { findById } from "@/app/(auth)/auth.repository";

export async function POST(request) {

    const refreshToken = request.cookies.get("refresh_token")?.value;

    if (!refreshToken) {
        return NextResponse.json(
            { message: "No refresh token" },
            { status: 401 }
        );
    }

    try {

        // El refresh token solo lleva "sub" (id de usuario) por diseño: no
        // conviene incrustar el rol en un token de vida larga, porque si el
        // rol del usuario cambia en la base de datos, el token viejo seguiría
        // teniendo el rol anterior hasta expirar. Por eso, en cada refresh
        // volvemos a leer el usuario actual desde la base de datos.
        const decoded = verifyRefreshToken(refreshToken);

        const user = await findById(decoded.sub);

        if (!user) {
            return NextResponse.json(
                { message: "Usuario no encontrado" },
                { status: 401 }
            );
        }

        const newAccessToken = generateAccessToken(user);

        const response = NextResponse.json(
            { message: "Token renovado" },
            { status: 200 }
        );

        setAccessCookie(response, newAccessToken);

        return response;

    } catch (error) {

        return NextResponse.json(
            { message: "Refresh token inválido" },
            { status: 401 }
        );
    }
}
