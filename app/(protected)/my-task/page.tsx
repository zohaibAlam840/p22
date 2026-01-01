"use client";

import React from "react";
import Link from "next/link";
import { toast } from "sonner";

import { listAssignedTasks, type AssignedTaskItem } from "@/lib/api/assignedTasks";
import { updateTask } from "@/lib/api/tasks";
import type { TaskPriority, TaskStatus } from "@/lib/api/tasks";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function MyTasksPage() {
  const [items, setItems] = React.useState<AssignedTaskItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [status, setStatus] = React.useState<TaskStatus | "ALL">("ALL");
  const [priority, setPriority] = React.useState<TaskPriority | "ALL">("ALL");

  async function refresh() {
    setLoading(true);
    try {
      const data = await listAssignedTasks({
        status: status === "ALL" ? undefined : status,
        priority: priority === "ALL" ? undefined : priority,
      });
      setItems(data.tasks ?? []);
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, priority]);

  async function markDone(taskId: string) {
    try {
      await updateTask(taskId, { status: "DONE" });
      toast.success("Marked as done");
      refresh();
    } catch (e: any) {
      toast.error(e?.message ?? "Update failed");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold">My tasks</h1>
          <p className="text-sm text-muted-foreground">
            Tasks assigned to you across all workspaces and projects.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <div className="w-full sm:w-48">
            <div className="text-xs text-muted-foreground mb-1">Status</div>
            <Select value={status} onValueChange={(v) => setStatus(v as any)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All</SelectItem>
                <SelectItem value="TODO">TODO</SelectItem>
                <SelectItem value="IN_PROGRESS">IN_PROGRESS</SelectItem>
                <SelectItem value="DONE">DONE</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-full sm:w-48">
            <div className="text-xs text-muted-foreground mb-1">Priority</div>
            <Select value={priority} onValueChange={(v) => setPriority(v as any)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All</SelectItem>
                <SelectItem value="LOW">LOW</SelectItem>
                <SelectItem value="MEDIUM">MEDIUM</SelectItem>
                <SelectItem value="HIGH">HIGH</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Card className="rounded-2xl">
        <CardContent className="p-6">
          {loading && <div className="text-sm text-muted-foreground">Loading…</div>}

          {!loading && items.length === 0 && (
            <div className="text-sm text-muted-foreground">No assigned tasks.</div>
          )}

          {!loading && items.length > 0 && (
            <div className="space-y-3">
              {items.map((t) => (
                <div key={t.id} className="rounded-xl border p-4 hover:bg-muted/40 transition-colors">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="font-semibold truncate">{t.title}</div>
                        <Badge variant="secondary">{t.status}</Badge>
                        <Badge variant="outline">{t.priority}</Badge>
                      </div>

                      <div className="mt-1 text-sm text-muted-foreground">
                        {t.project.workspace.name} / {t.project.name}
                      </div>

                      {t.description && (
                        <div className="mt-2 text-sm text-muted-foreground line-clamp-2">
                          {t.description}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col sm:items-end gap-2">
                      <div className="text-xs text-muted-foreground">
                        Due: {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : "—"}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          asChild
                        >
                          <Link href={`/workspaces/${t.project.workspace.id}/projects/${t.project.id}`}>
                            Open
                          </Link>
                        </Button>

                        <Button
                          size="sm"
                          onClick={() => markDone(t.id)}
                          disabled={t.status === "DONE"}
                        >
                          Mark done
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
