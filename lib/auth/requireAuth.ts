import type { NextRequest } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth/session";

export async function requireAuth(req: NextRequest): Promise<string> {
  const userId = await getUserIdFromRequest(req);
  if (!userId) {
    const err = new Error("Unauthorized");
    // @ts-expect-error attach status
    err.status = 401;
    throw err;
  }
  return userId;
}
