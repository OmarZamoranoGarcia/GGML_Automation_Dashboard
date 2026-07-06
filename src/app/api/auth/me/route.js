import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function GET(request) {
  const token = request.cookies.get("access_token")?.value;

  if (!token) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    return NextResponse.json({
      user: {
        id: decoded.sub,
        email: decoded.email,
        role: decoded.role,
      },
    });
  } catch (error) {
    return NextResponse.json({ user: null }, { status: 401 });
  }
}
