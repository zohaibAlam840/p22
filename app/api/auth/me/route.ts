import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseRouteClient } from "@/lib/supabase/route";

export async function GET(req: NextRequest) {
  const res = NextResponse.json({ ok: true }, { status: 200 });
  const supabase = createSupabaseRouteClient(req, res);

  const { data, error } = await supabase.auth.getUser();
  if (error) return NextResponse.json({ user: null }, { status: 200 });

  return NextResponse.json({ user: data.user }, { status: 200, headers: res.headers });
}
