import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

export function generateAccessToken(user) {
    return jwt.sign(
        {
            sub: user.id,
            email: user.email,
            role: user.role
        },
        JWT_SECRET,
        { expiresIn: "15m" }
    );
}

export function generateRefreshToken(user) {
    return jwt.sign(
        {
            sub: user.id
        },
        JWT_SECRET,
        { expiresIn: "1d" }
    );
}


export function verifyAccessToken(token) {
    return jwt.verify(token, JWT_SECRET);
}

export function verifyRefreshToken(token) {
    return jwt.verify(token, JWT_SECRET);
}
