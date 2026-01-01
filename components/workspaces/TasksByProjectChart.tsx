"use client";

import React from "react";
import type { ProjectItem } from "@/lib/api/project";
import { Card, CardContent } from "@/components/ui/card";

export default function TasksByProjectChart({
  loading,
  projects,
}: {
  loading: boolean;
  projects: ProjectItem[];
}) {
  // show top 6 by task count
  const rows = React.useMemo(() => {
    const mapped = projects
      .map((p) => ({
        id: p.id,
        name: p.name,
        tasks: p._count?.tasks ?? 0,
      }))
      .sort((a, b) => b.tasks - a.tasks)
      .slice(0, 6);

    const max = Math.max(1, ...mapped.map((r) => r.tasks));
    return { mapped, max };
  }, [projects]);

  return (
    <Card className="rounded-2xl">
      <CardContent className="p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="font-semibold">Tasks by project</div>
            <div className="text-sm text-muted-foreground">
              Distribution of tasks across your top projects
            </div>
          </div>
        </div>

        <div className="mt-5">
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading…</div>
          ) : rows.mapped.length === 0 ? (
            <div className="text-sm text-muted-foreground">No projects yet.</div>
          ) : (
            <div className="space-y-3">
              {rows.mapped.map((r) => {
                const pct = Math.round((r.tasks / rows.max) * 100);
                return (
                  <div key={r.id} className="grid grid-cols-[1fr_auto] gap-3 items-center">
                    <div className="min-w-0">
                      <div className="flex items-center justify-between gap-3">
                        <div className="font-medium truncate">{r.name}</div>
                        <div className="text-sm text-muted-foreground">{r.tasks} tasks</div>
                      </div>
                      <div className="mt-2 h-2 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-foreground/70"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground w-10 text-right">{pct}%</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
