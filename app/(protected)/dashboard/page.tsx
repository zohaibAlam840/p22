"use client";

import React from "react";
import { toast } from "sonner";
import { Layers3, Users2, Ticket } from "lucide-react";

import { listOrganizations, type OrganizationListItem } from "@/lib/api/organizations";

import CreateOrganizationDialog from "@/components/workspaces/CreateOrganizationDialog";
import OrganizationsTable from "@/components/workspaces/WorkspacesTable";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function safeNum(n: any) {
  const x = Number(n);
  return Number.isFinite(x) ? x : 0;
}

export default function DashboardPage() {
  const [items, setItems] = React.useState<OrganizationListItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  async function refresh() {
    setLoading(true);
    try {
      const data = await listOrganizations();
      setItems(data.organizations ?? []);
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    refresh();
  }, []);

  const totalOrgs = items.length;
  const totalMembers = items.reduce((sum, o) => sum + safeNum(o.membersCount), 0);
  const totalTickets = items.reduce((sum, o) => sum + safeNum(o.ticketsCount), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Overview of your organizations</p>
        </div>
        <CreateOrganizationDialog onCreated={refresh} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <Layers3 className="h-4 w-4" /> Organizations
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-3xl font-semibold">{loading ? "…" : totalOrgs}</div>
            <div className="mt-2 text-xs text-muted-foreground">Total organizations you belong to</div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <Users2 className="h-4 w-4" /> Members
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-3xl font-semibold">{loading ? "…" : totalMembers}</div>
            <div className="mt-2 text-xs text-muted-foreground">Across all organizations</div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <Ticket className="h-4 w-4" /> Tickets
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-3xl font-semibold">{loading ? "…" : totalTickets}</div>
            <div className="mt-2 text-xs text-muted-foreground">Across all organizations</div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium">Your organizations</div>
          <div className="text-xs text-muted-foreground">Manage & open organizations</div>
        </div>

        <OrganizationsTable items={items} loading={loading} onChanged={refresh} />
      </div>
    </div>
  );
}
