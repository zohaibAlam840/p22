"use client";

import React from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";

type TicketStatus = "OPEN" | "INVESTIGATING" | "MITIGATED" | "RESOLVED";

export default function CreateTicketDialog({ orgId }: { orgId: string }) {
  const router = useRouter();

  const [open, setOpen] = React.useState(false);
  const [busy, setBusy] = React.useState(false);

  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [severity, setSeverity] = React.useState<number>(3);

  function clampSeverity(n: number) {
    if (!Number.isFinite(n)) return 3;
    return Math.min(5, Math.max(1, Math.trunc(n)));
  }

  async function onCreate() {
    const t = title.trim();
    if (!t) return toast.error("Title is required");

    setBusy(true);
    try {
      const supabase = createSupabaseBrowserClient();

      // IMPORTANT: get current user id for created_by (required by RLS)
      const { data: userRes, error: userErr } = await supabase.auth.getUser();
      if (userErr) throw new Error(userErr.message);
      const userId = userRes?.user?.id;
      if (!userId) throw new Error("Not authenticated");

      const { error } = await supabase.from("tickets").insert({
        org_id: orgId,
        created_by: userId,              // ✅ required by your RLS policy
        title: t,
        description: description.trim(),
        severity: clampSeverity(severity),
        status: "OPEN" as TicketStatus,  // ✅ matches enum
      });

      if (error) throw new Error(error.message);

      toast.success("Ticket created");
      setOpen(false);
      setTitle("");
      setDescription("");
      setSeverity(3);

      router.refresh();
    } catch (e: any) {
      toast.error(e?.message ?? "Create failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">New Ticket</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create ticket</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <div className="text-sm font-medium mb-1">Title</div>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Short summary"
              disabled={busy}
            />
          </div>

          <div>
            <div className="text-sm font-medium mb-1">Description</div>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Details…"
              disabled={busy}
            />
          </div>

          <div>
            <div className="text-sm font-medium mb-1">Severity (1–5)</div>
            <Input
              type="number"
              min={1}
              max={5}
              value={severity}
              onChange={(e) => setSeverity(Number(e.target.value))}
              onBlur={() => setSeverity((s) => clampSeverity(s))}
              disabled={busy}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={onCreate} disabled={busy}>
            {busy ? "Creating…" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
