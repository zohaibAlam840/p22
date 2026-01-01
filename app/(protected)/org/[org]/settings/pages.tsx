import { requireOrg, isAtLeast } from "@/lib/org/requireOrg";

export const dynamic = "force-dynamic";

export default async function OrgSettingsPage({
  params,
}: {
  params: Promise<{ org: string }>;
}) {
  const { org } = await params;
  const ctx = await requireOrg(org);

  if (!isAtLeast(ctx.role, "ADMIN")) {
    return (
      <div className="border rounded-2xl p-10 text-center text-sm text-muted-foreground">
        You do not have access to organization settings.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="border rounded-2xl p-4">
        <div className="text-lg font-semibold">Settings</div>
        <div className="text-sm text-muted-foreground mt-1">
          Admin/Owner settings area. (You can add rename org, invite flow, role changes, etc.)
        </div>
      </div>

      <div className="border rounded-2xl p-4 text-sm text-muted-foreground">
        Placeholder: add org rename / invite link / role management. Owner/Admin capabilities are required.
      </div>
    </div>
  );
}
