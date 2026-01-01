import type { NextRequest } from "next/server";
import { verifySession } from "./jwt";

export const AUTH_COOKIE = "auth_token";

export function cookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  };
}

export async function getUserIdFromRequest(req: NextRequest): Promise<string | null> {
  const token = req.cookies.get(AUTH_COOKIE)?.value;
  if (!token) return null;

  try {
    const payload = await verifySession(token);
    return typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}
