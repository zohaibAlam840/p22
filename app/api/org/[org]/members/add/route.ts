import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const ROLE_ORDER = ["VIEWER", "MEMBER", "ADMIN", "OWNER"] as const;
type OrgRole = (typeof ROLE_ORDER)[number];

export async function POST(
  req: Request,
  { params }: { params: Promise<{ org: string }> }
) {
  try {
    const { org } = await params;

    const supabase = await createSupabaseServerClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    const email = String(body?.email ?? "").trim().toLowerCase();
    const role = (String(body?.role ?? "MEMBER").toUpperCase() as OrgRole) || "MEMBER";

    if (!email.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }
    if (!ROLE_ORDER.includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Call RPC (no service role)
    const { error } = await supabase.rpc("add_member_by_email", {
      p_org_id: org,
      p_email: email,
      p_role: role,
    });

    if (error) {
      const msg = error.message || "RPC failed";
      if (msg.includes("user_not_found")) {
        return NextResponse.json(
          { error: "User not found in Auth. Ask them to sign up/login once first." },
          { status: 404 }
        );
      }
      if (msg.includes("forbidden")) {
        return NextResponse.json({ error: "Forbidden: Admin only" }, { status: 403 });
      }
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    // CRITICAL: never throw; always return JSON so UI can display it
    return NextResponse.json(
      { error: e?.message ?? "Server error" },
      { status: 500 }
    );
  }
}
