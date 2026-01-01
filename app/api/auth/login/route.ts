import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createSupabaseRouteClient } from "@/lib/supabase/route";

const LoginSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(1).max(200),
});

export async function POST(req: NextRequest) {
  const json = await req.json().catch(() => null);
  const parsed = LoginSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const res = NextResponse.json({ ok: true }, { status: 200 });
  const supabase = createSupabaseRouteClient(req, res);

  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }

  // Optional: return user payload (some UIs expect it)
  const { data: userData } = await supabase.auth.getUser();
  return NextResponse.json({ user: userData.user }, { status: 200, headers: res.headers });
}
