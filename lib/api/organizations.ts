import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export type OrgRole = "OWNER" | "ADMIN" | "MEMBER" | "VIEWER";

export type OrganizationListItem = {
  id: string;
  name: string;
  myRole: OrgRole;

  // Optional fields if you later add counts in a view/RPC.
  membersCount?: number;
  ticketsCount?: number;
  createdAt?: string;
};

export async function listOrganizations(): Promise<{ organizations: OrganizationListItem[] }> {
  const supabase = createSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("org_memberships")
    .select("role, created_at, organizations:org_id ( id, name, created_at )")
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);

  const organizations: OrganizationListItem[] = (data ?? [])
    .map((row: any) => {
      const org = Array.isArray(row.organizations) ? row.organizations[0] : row.organizations;

      return {
        id: (org?.id ?? "") as string,
        name: (org?.name ?? "") as string,
        myRole: row.role as OrgRole,
        createdAt: org?.created_at as string | undefined,
        membersCount: 0,
        ticketsCount: 0,
      };
    })
    .filter((o) => Boolean(o.id && o.name));

  return { organizations };
}


/**
 * Preferred approach for Task A:
 * - Call a Postgres RPC that atomically:
 *   1) inserts into organizations
 *   2) inserts OWNER membership for auth.uid()
 *
 * Your DB should define: create_organization(org_name text) returns uuid (or record)
 */
export async function createOrganization(input: { name: string }) {
  const supabase = createSupabaseBrowserClient();

  const { data, error } = await supabase.rpc("create_organization", {
    org_name: input.name,
  });

  if (error) throw new Error(error.message);

  return { ok: true, data };
}

/**
 * Deleting organizations is typically OWNER-only (enforced via RLS).
 */
export async function deleteOrganization(orgId: string) {
  const supabase = createSupabaseBrowserClient();

  const { error } = await supabase.from("organizations").delete().eq("id", orgId);

  if (error) throw new Error(error.message);

  return { ok: true };
}
