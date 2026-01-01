"use client";

import React from "react";
import { toast } from "sonner";
import { useParams, useRouter } from "next/navigation";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type OrgRole = "VIEWER" | "MEMBER" | "ADMIN";

function isUuid(v: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
}

/**
 * If your route param is always org UUID, you can simplify this and just return orgParam.
 * If you use slug routes like /org/acme, keep this resolver AND ensure organizations.slug exists.
 */
async function resolveOrgId(supabase: ReturnType<typeof createSupabaseBrowserClient>, orgParam: string) {
  if (isUuid(orgParam)) return orgParam;

  // OPTIONAL: only if you have organizations.slug
  const { data, error } = await supabase
    .from("organizations")
    .select("id")
    .eq("slug", orgParam)
    .single();

  if (error) throw new Error(`Org not found (slug="${orgParam}"): ${error.message}`);
  return data.id as string;
}

export default function AddMemberDialog() {
  const router = useRouter();
  const params = useParams<{ org: string }>();
  const orgParam = params.org;

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

      // If your URL param is already a UUID, this returns it immediately.
      const orgId = await resolveOrgId(supabase, orgParam);

      const { error } = await supabase.rpc("add_member_by_email", {
        p_org_id: orgId,
        p_email: e,
        p_role: role,
      });

      if (error) {
        // Normalize expected errors (if your RPC raises these strings)
        if (error.message.includes("user_not_found")) {
          throw new Error("User not found. Ask them to sign up/login once first.");
        }
        if (error.message.includes("forbidden")) {
          throw new Error("Forbidden: only ADMIN/OWNER can add members.");
        }

        // Otherwise, show full diagnostic
        const msg = [
          error.message,
          error.code ? `code=${error.code}` : null,
          error.details ? `details=${error.details}` : null,
          error.hint ? `hint=${error.hint}` : null,
        ]
          .filter(Boolean)
          .join(" | ");

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
        <Button size="sm">Add member</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add member by email</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <div className="text-sm font-medium mb-1">Email</div>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              disabled={busy}
            />
          </div>

          <div>
            <div className="text-sm font-medium mb-1">Role</div>
            <Select value={role} onValueChange={(v) => setRole(v as OrgRole)}>
              <SelectTrigger disabled={busy}>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="VIEWER">Viewer (read-only)</SelectItem>
                <SelectItem value="MEMBER">Member (create/edit tickets)</SelectItem>
                <SelectItem value="ADMIN">Admin (manage members/roles)</SelectItem>
              </SelectContent>
            </Select>

            <div className="text-xs text-muted-foreground mt-2">
              Viewer: read-only. Member: can create/update tickets. Admin: can add/remove members and change roles.
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" disabled={busy} onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button disabled={busy} onClick={onSubmit}>
            {busy ? "Adding…" : "Add member"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
