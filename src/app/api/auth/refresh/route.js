import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function POST(request) {

    const refreshToken = request.cookies.get("refresh_token")?.value;

    // NO HAY REFRESH TOKEN
    if (!refreshToken) {
        return NextResponse.json(
            { message: "No refresh token" },
            { status: 401 }
        );
    }

    try {

        // VERIFICAR REFRESH TOKEN
        const decoded = jwt.verify(
            refreshToken,
            process.env.JWT_SECRET
        );

        // GENERAR NUEVO ACCESS TOKEN
        const newAccessToken = jwt.sign(
            {
                sub: decoded.sub,
                email: decoded.email,
                role: decoded.role
            },
            process.env.JWT_SECRET,
            { expiresIn: "15m" }
        );

        // RESPUESTA CON COOKIE NUEVA  
        const response = NextResponse.json(
            { message: "Token renovado" },
            { status: 200 }
        );

        response.cookies.set("access_token", newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 15 // 15 min
        });

        return response;

    } catch (error) {

        // REFRESH TOKEN INVÁLIDO / EXPIRADO  
        return NextResponse.json(
            { message: "Refresh token inválido" },
            { status: 401 }
        );
    }
}