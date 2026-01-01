"use client";

import React from "react";
import { toast } from "sonner";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

type OrgRole = "VIEWER" | "MEMBER" | "ADMIN";

function isUuid(v: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
}

async function resolveOrgId(supabase: any, orgParam: string) {
  if (isUuid(orgParam)) return orgParam;

  const { data, error } = await supabase
    .from("organizations")
    .select("id")
    .eq("slug", orgParam)
    .single();

  if (error) throw new Error(`Org not found. ${error.message}`);
  return data.id as string;
}

export default function AddMemberDialog() {
  const router = useRouter();
  const params = useParams<{ org: string }>();
  const org = params.org;

  const [open, setOpen] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [role, setRole] = React.useState<OrgRole>("MEMBER");

  async function onSubmit() {
    const e = email.trim().toLowerCase();
    if (!e.includes("@")) return toast.error("Enter a valid email");

    setBusy(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const orgId = await resolveOrgId(supabase, org);

      const { error } = await supabase.rpc("add_member_by_email", {
        p_org_id: orgId,
        p_email: e,
        p_role: role,
      });

      if (error) {
        console.error("add_member_by_email error:", error);

        if (error.message.includes("user_not_found")) {
          throw new Error("User not found. Ask them to sign up/login once first.");
        }
        if (error.message.includes("forbidden")) {
          throw new Error("Forbidden: only ADMIN/OWNER can add members.");
        }

        const msg = [
          error.message,
          error.code ? `code=${error.code}` : null,
          error.details ? `details=${error.details}` : null,
          error.hint ? `hint=${error.hint}` : null,
        ].filter(Boolean).join(" | ");

        throw new Error(msg);
      }

      toast.success("Member added");
      setOpen(false);
      setEmail("");
      setRole("MEMBER");
      router.refresh();
    } catch (err: any) {
      toast.error(String(err?.message ?? err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Add Member</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add member by email</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <div className="text-sm font-medium mb-1">Email</div>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="user@example.com" />
          </div>

          <div>
            <div className="text-sm font-medium mb-1">Role</div>
            <Select value={role} onValueChange={(v) => setRole(v as OrgRole)}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="VIEWER">Viewer (read-only)</SelectItem>
                <SelectItem value="MEMBER">Member (create/edit tickets)</SelectItem>
                <SelectItem value="ADMIN">Admin (manage members/roles)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" disabled={busy} onClick={() => setOpen(false)}>Cancel</Button>
          <Button disabled={busy} onClick={onSubmit}>
            {busy ? "Sending…" : "Send email"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
