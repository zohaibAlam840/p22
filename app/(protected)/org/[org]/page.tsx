import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireOrg } from "@/lib/org/requireOrg";

export const dynamic = "force-dynamic";

export default async function OrgOverviewPage({
  params,
}: {
  params: Promise<{ org: string }>;
}) {
  const { org } = await params;
  const ctx = await requireOrg(org);
  const supabase = await createSupabaseServerClient();

  const [{ count: ticketsCount }, { count: membersCount }] = await Promise.all([
    supabase.from("tickets").select("*", { count: "exact", head: true }).eq("org_id", ctx.org.id),
    supabase.from("org_memberships").select("*", { count: "exact", head: true }).eq("org_id", ctx.org.id),
  ]);

  return (
    <div className="space-y-4">
      <div className="border rounded-2xl p-4">
        <div className="text-lg font-semibold">Overview</div>
        <div className="text-sm text-muted-foreground mt-1">
          Org-scoped workspace. Switching org changes the entire context; other-org data must never appear.
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="border rounded-2xl p-3">
            <div className="text-sm text-muted-foreground">Tickets</div>
            <div className="text-2xl font-semibold">{ticketsCount ?? 0}</div>
            <Link className="text-sm underline" href={`/org/${ctx.org.id}/tickets`}>
              Open tickets
            </Link>
          </div>

          <div className="border rounded-2xl p-3">
            <div className="text-sm text-muted-foreground">Members</div>
            <div className="text-2xl font-semibold">{membersCount ?? 0}</div>
            <Link className="text-sm underline" href={`/org/${ctx.org.id}/members`}>
              Manage members
            </Link>
          </div>
        </div>
      </div>

      <div className="border rounded-2xl p-4">
        <div className="font-semibold">Quick links</div>
        <div className="mt-2 text-sm space-y-1">
          <div>
            <Link className="underline" href={`/org/${ctx.org.id}/audit`}>Audit Log</Link>
          </div>
          <div>
            <Link className="underline" href={`/org/${ctx.org.id}/tags`}>Tags</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
