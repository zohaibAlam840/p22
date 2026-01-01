"use client";

import React from "react";
import { toast } from "sonner";
import { listTaskLogs, type TaskLog, type TaskItem } from "@/lib/api/tasks";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function TaskLogsDialog({
  task,
  open,
  onOpenChange,
}: {
  task: TaskItem | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [logs, setLogs] = React.useState<TaskLog[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;
    async function load() {
      if (!task || !open) return;
      setLoading(true);
      try {
        const res = await listTaskLogs(task.id);
        if (mounted) setLogs(res.logs);
      } catch (e: any) {
        toast.error(e?.message ?? "Failed to load logs");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [task, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Activity logs</DialogTitle>
        </DialogHeader>

        <div className="text-sm text-muted-foreground">
          Task: <span className="text-foreground font-medium">{task?.title}</span>
        </div>

        <ScrollArea className="h-[360px] border rounded-lg p-3">
          {loading && <div className="text-sm text-muted-foreground">Loading…</div>}
          {!loading && logs.length === 0 && <div className="text-sm text-muted-foreground">No logs yet.</div>}
          <div className="space-y-3">
            {logs.map((l) => (
              <div key={l.id} className="rounded-lg border p-3">
                <div className="font-medium">{l.action}</div>
                <div className="text-xs text-muted-foreground">
                  {l.user.name} • {new Date(l.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
