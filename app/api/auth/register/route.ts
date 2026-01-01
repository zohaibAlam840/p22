import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createSupabaseRouteClient } from "@/lib/supabase/route";

const RegisterSchema = z.object({
  name: z.string().min(2).max(60),
  email: z.string().email().max(255),
  password: z.string().min(8).max(200),
});

export async function POST(req: NextRequest) {
  const json = await req.json().catch(() => null);
  const parsed = RegisterSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { name, email, password } = parsed.data;

  const res = NextResponse.json({ ok: true }, { status: 201 });
  const supabase = createSupabaseRouteClient(req, res);

  const origin = req.headers.get("origin") ?? "http://localhost:3000";
  const emailRedirectTo = `${origin}/auth/callback?next=/dashboard`;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
      emailRedirectTo,
    },
  });

  if (error) {
    // Supabase may return 400/422 style errors; map to 409 if email exists is not reliably detectable.
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // If email confirmation is ON, session can be null here; that is expected.
  return NextResponse.json(
    { user: data.user, session: data.session, needsEmailConfirmation: !data.session },
    { status: 201, headers: res.headers }
  );
}
