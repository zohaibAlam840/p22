import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireOrg } from "@/lib/org/requireOrg";

export const dynamic = "force-dynamic";

type Ticket = {
  id: string;
  org_id: string;
  title: string;
  description: string | null;
  status: string;
  severity: number;
  created_at: string;
  updated_at: string;
};

type EventRow = {
  id: string;
  org_id: string;
  ticket_id: string;
  type: string;
  message: string | null;
  created_at: string;
  actor_id: string | null;
};

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ org: string; ticketId: string }>;
}) {
  const { org, ticketId } = await params;
  const ctx = await requireOrg(org);
  const supabase = await createSupabaseServerClient();

  const { data: ticket, error: tErr } = await supabase
    .from("tickets")
    .select("id, org_id, title, description, status, severity, created_at, updated_at")
    .eq("org_id", ctx.org.id)
    .eq("id", ticketId)
    .maybeSingle();

  if (tErr) throw new Error(tErr.message);
  if (!ticket) {
    return (
      <div className="border rounded-2xl p-10 text-center text-sm text-muted-foreground">
        Ticket not found.
      </div>
    );
  }

  const { data: events, error: eErr } = await supabase
    .from("ticket_events")
    .select("id, org_id, ticket_id, type, message, created_at, actor_id")
    .eq("org_id", ctx.org.id)
    .eq("ticket_id", ticketId)
    .order("created_at", { ascending: false })
    .limit(100);

  if (eErr) throw new Error(eErr.message);

  const t = ticket as Ticket;
  const rows = (events ?? []) as EventRow[];

  return (
    <div className="space-y-4">
      <div className="border rounded-2xl p-4">
        <div className="text-lg font-semibold">{t.title}</div>
        <div className="text-sm text-muted-foreground mt-1">
          {t.status} • Severity {t.severity}
        </div>
        {t.description && <div className="mt-3 text-sm whitespace-pre-wrap">{t.description}</div>}
      </div>

      <div className="border rounded-2xl p-4">
        <div className="font-semibold">Timeline</div>
        <div className="text-sm text-muted-foreground mt-1">
          Includes comments/status/assignment/tag/attachment events.
        </div>

        <div className="mt-4 space-y-3">
          {rows.map((ev) => (
            <div key={ev.id} className="border rounded-2xl p-3">
              <div className="text-xs text-muted-foreground">
                {new Date(ev.created_at).toLocaleString()} • {ev.type}
              </div>
              <div className="text-sm mt-1">{ev.message ?? "—"}</div>
            </div>
          ))}

          {rows.length === 0 && (
            <div className="py-10 text-center text-sm text-muted-foreground">
              No timeline events yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
