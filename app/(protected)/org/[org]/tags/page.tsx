import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireOrg, isAtLeast } from "@/lib/org/requireOrg";
import CreateTagDialog from "../_components/CreateTagDialog"; // ✅ add this

export const dynamic = "force-dynamic";

type TagRow = { id: string; org_id: string; name: string; created_at: string };

export default async function TagsPage({
  params,
}: {
  params: Promise<{ org: string }>;
}) {
  const { org } = await params;
  const ctx = await requireOrg(org);

  if (!isAtLeast(ctx.role, "MEMBER")) {
    return (
      <div className="border rounded-2xl p-10 text-center text-sm text-muted-foreground">
        Viewers cannot manage tags.
      </div>
    );
  }

  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("tags")
    .select("id, org_id, name, created_at")
    .eq("org_id", ctx.org.id)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);

  const rows = (data ?? []) as TagRow[];

  return (
    <div className="space-y-4">
      {/* ✅ header now has button */}
      <div className="border rounded-2xl p-4 flex items-start justify-between gap-3">
        <div>
          <div className="text-lg font-semibold">Tags</div>
          <div className="text-sm text-muted-foreground mt-1">
            Tags are used for ticket filtering and timeline events.
          </div>
        </div>

        <CreateTagDialog /> {/* ✅ added */}
      </div>

      <div className="border rounded-2xl overflow-hidden">
        <div className="divide-y">
          {rows.map((t) => (
            <div key={t.id} className="p-4 flex items-center justify-between">
              <div className="text-sm font-medium">{t.name}</div>
              <div className="text-xs text-muted-foreground">
                {new Date(t.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}

          {rows.length === 0 && (
            <div className="p-10 text-center text-sm text-muted-foreground">
              No tags yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
