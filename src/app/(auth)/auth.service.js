import bcrypt from "bcryptjs";
import { findByEmail } from "@/app/(auth)/auth.repository";
import { generateAccessToken, generateRefreshToken } from "@/app/(auth)/jwt";

export async function login({ email, password }) {

    const user = await findByEmail(email);

    if (!user) {
        throw new Error("Credenciales inválidas.");
    }

    const isPasswordValid = await bcrypt.compare(
        password,
        user.password_hash
    );

    if (!isPasswordValid) {
        throw new Error("Credenciales inválidas.");
    }

    return {
        id: user.id,
        email: user.email,
        role: user.role,
        accessToken: generateAccessToken(user),
        refreshToken: generateRefreshToken(user)
    };
}