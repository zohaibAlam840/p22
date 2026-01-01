"use client";

import React from "react";
import { FolderKanban, Users, ListChecks } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

function StatCard({
  label,
  value,
  icon: Icon,
  loading,
}: {
  label: string;
  value: React.ReactNode;
  icon: any;
  loading: boolean;
}) {
  return (
    <Card className="rounded-2xl">
      <CardContent className="p-6 flex items-center gap-4">
        <div className="h-11 w-11 rounded-2xl bg-muted grid place-items-center">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="text-sm text-muted-foreground">{label}</div>
          <div className="text-2xl font-semibold leading-tight">
            {loading ? "…" : value}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function WorkspaceOverviewCards({
  loading,
  projectsCount,
  membersCount,
  totalTasks,
}: {
  loading: boolean;
  projectsCount: number;
  membersCount: number;
  totalTasks: number;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <StatCard loading={loading} label="Projects" value={projectsCount} icon={FolderKanban} />
      <StatCard loading={loading} label="Members" value={membersCount} icon={Users} />
      <StatCard loading={loading} label="Total tasks" value={totalTasks} icon={ListChecks} />
    </div>
  );
}
