import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireOrg, isAtLeast } from "@/lib/org/requireOrg";
import CreateTicketDialog from "../_components/CreateTicketDialog";

export const dynamic = "force-dynamic";

type TicketRow = {
  id: string;
  org_id: string;
  title: string;
  status: string;
  severity: number;
  updated_at: string;
};

export default async function TicketsPage({
  params,
}: {
  params: Promise<{ org: string }>;
}) {
  const { org } = await params;
  const ctx = await requireOrg(org);
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("tickets")
    .select("id, org_id, title, status, severity, updated_at")
    .eq("org_id", ctx.org.id)
    .order("updated_at", { ascending: false })
    .limit(50);

  if (error) throw new Error(error.message);

  const rows = (data ?? []) as TicketRow[];
  const canCreate = isAtLeast(ctx.role, "MEMBER"); // viewer is read-only :contentReference[oaicite:3]{index=3}

  return (
    <div className="space-y-4">
      <div className="border rounded-2xl p-4 flex items-start justify-between gap-3">
        <div>
          <div className="text-lg font-semibold">Tickets</div>
          <div className="text-sm text-muted-foreground">
            Status workflow + timeline feed are core requirements.
          </div>
        </div>

        {canCreate && <CreateTicketDialog orgId={ctx.org.id} />}
      </div>

      <div className="border rounded-2xl overflow-hidden">
        <div className="divide-y">
          {rows.map((t) => (
            <Link
              key={t.id}
              href={`/org/${ctx.org.id}/tickets/${t.id}`}
              className="block p-4 hover:bg-muted/40"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-medium truncate">{t.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {t.status} • Severity {t.severity}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground whitespace-nowrap">
                  {new Date(t.updated_at).toLocaleString()}
                </div>
              </div>
            </Link>
          ))}

          {rows.length === 0 && (
            <div className="p-10 text-center text-sm text-muted-foreground">
              No tickets yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
