import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

export function generateAccessToken(user) {
  return jwt.sign(
    { 
        sub: user.id, 
        email: user.email, 
        role: user.role, 
        type: "access" },
    JWT_SECRET,
    { expiresIn: "15m" },
  );
}

export function generateRefreshToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      type: "refresh"
    },
    JWT_SECRET,
    { expiresIn: "1d" },
  );
}

export function verifyAccessToken(token) {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.type !== "access") throw new Error("Tipo de token inválido");
    return decoded;
}

export function verifyRefreshToken(token) {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.type !== "refresh") throw new Error("Tipo de token inválido");
    return decoded;
}