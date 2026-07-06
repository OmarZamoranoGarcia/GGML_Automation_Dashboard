import { NextResponse } from "next/server";
import { clearAuthCookies } from "@/app/(auth)/cookies";

export async function POST() {
  const response = NextResponse.json({ ok: true, message: "Sesión cerrada" });

  clearAuthCookies(response);

  return response;
}
