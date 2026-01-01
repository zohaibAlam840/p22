"use client";

import React from "react";
import { toast } from "sonner";
import { useParams, useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function CreateTagDialog() {
  const router = useRouter();
  const params = useParams<{ org: string }>();
  const orgId = params.org;

  const [open, setOpen] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [name, setName] = React.useState("");

  async function onCreate() {
    const n = name.trim();
    if (!n) return toast.error("Tag name is required");

    setBusy(true);
    try {
      const supabase = createSupabaseBrowserClient();

      const { error } = await supabase.from("tags").insert({
        org_id: orgId,
        name: n,
      });

      if (error) throw new Error(error.message);

      toast.success("Tag created");
      setOpen(false);
      setName("");
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
        <Button size="sm">New tag</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create tag</DialogTitle>
        </DialogHeader>

        <div className="space-y-2">
          <div className="text-sm font-medium">Name</div>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Billing, Urgent, Bug"
            disabled={busy}
          />
          <div className="text-xs text-muted-foreground">
            Only members/admins can create tags (enforced by RLS).
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
