import { notFound, redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type OrgRole = "OWNER" | "ADMIN" | "MEMBER" | "VIEWER";

export function isAtLeast(role: OrgRole, min: OrgRole) {
  const order: OrgRole[] = ["VIEWER", "MEMBER", "ADMIN", "OWNER"];
  return order.indexOf(role) >= order.indexOf(min);
}

export async function requireOrg(orgId: string) {
  const supabase = await createSupabaseServerClient();

  const { data: auth, error: authErr } = await supabase.auth.getUser();
  if (authErr) throw new Error(authErr.message);
  if (!auth?.user) redirect("/login");

  const { data, error } = await supabase
    .from("org_memberships")
    .select("role, organizations:org_id ( id, name, created_at )")
    .eq("org_id", orgId)
    .eq("user_id", auth.user.id)
    .maybeSingle();

  if (error) throw new Error(error.message);

  // Supabase may type joins as array; handle both.
  const orgRow = Array.isArray((data as any)?.organizations)
    ? (data as any).organizations[0]
    : (data as any)?.organizations;

  if (!orgRow?.id) notFound();

  return {
    user: auth.user,
    role: (data as any).role as OrgRole,
    org: {
      id: orgRow.id as string,
      name: orgRow.name as string,
      createdAt: (orgRow.created_at as string | null) ?? null,
    },
  };
}
