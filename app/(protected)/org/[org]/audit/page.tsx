import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireOrg } from "@/lib/org/requireOrg";

export const dynamic = "force-dynamic";

type AuditRow = {
  id: string;
  org_id: string;
  actor_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  created_at: string;
};

export default async function AuditPage({
  params,
}: {
  params: Promise<{ org: string }>;
}) {
  const { org } = await params;
  const ctx = await requireOrg(org);
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("audit_logs")
    .select("id, org_id, actor_id, action, entity_type, entity_id, created_at")
    .eq("org_id", ctx.org.id)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) throw new Error(error.message);

  const rows = (data ?? []) as AuditRow[];

  return (
    <div className="space-y-4">
      <div className="border rounded-2xl p-4">
        <div className="text-lg font-semibold">Audit Log</div>
        <div className="text-sm text-muted-foreground mt-1">
          Insert-only audit trail with org-scoped read access.
        </div>
      </div>

      <div className="border rounded-2xl overflow-hidden">
        <div className="divide-y">
          {rows.map((r) => (
            <div key={r.id} className="p-4">
              <div className="text-xs text-muted-foreground">
                {new Date(r.created_at).toLocaleString()}
              </div>
              <div className="text-sm font-medium mt-1">{r.action}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {r.entity_type}
                {r.entity_id ? ` • ${r.entity_id}` : ""}
              </div>
            </div>
          ))}

          {rows.length === 0 && (
            <div className="p-10 text-center text-sm text-muted-foreground">
              No audit entries yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
