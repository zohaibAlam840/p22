"use client";

import React from "react";
import { toast } from "sonner";
import { can, type WorkspaceRole } from "@/lib/rbac/workspace";
import type { MemberItem } from "@/lib/api/member";
import { updateMemberRole, removeMember } from "@/lib/api/member";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function MembersTable({
  workspaceId,
  myRole,
  members,
  onChanged,
}: {
  workspaceId: string;
  myRole: WorkspaceRole;
  members: MemberItem[];
  onChanged: () => void;
}) {
  async function onRoleChange(memberId: string, role: WorkspaceRole) {
    try {
      await updateMemberRole(workspaceId, memberId, role);
      toast.success("Role updated");
      onChanged();
    } catch (e: any) {
      toast.error(e?.message ?? "Role update failed");
    }
  }

  async function onRemove(memberId: string) {
    try {
      await removeMember(workspaceId, memberId);
      toast.success("Member removed");
      onChanged();
    } catch (e: any) {
      toast.error(e?.message ?? "Remove failed");
    }
  }

  const canChangeRole = can(myRole, "workspace:changeRole");
  const canRemove = can(myRole, "workspace:removeMember");

  return (
    <div className="border rounded-2xl overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {members.map((m) => (
            <TableRow key={m.id}>
              <TableCell className="font-medium">{m.user.name}</TableCell>
              <TableCell className="text-muted-foreground">{m.user.email}</TableCell>
              <TableCell>
                {m.role === "OWNER" ? (
                  <Badge variant="secondary">OWNER</Badge>
                ) : (
                  <div className="max-w-[180px]">
                    <Select
                      value={m.role}
                      onValueChange={(v) => onRoleChange(m.id, v as WorkspaceRole)}
                      disabled={!canChangeRole}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ADMIN">ADMIN</SelectItem>
                        <SelectItem value="MEMBER">MEMBER</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </TableCell>

              <TableCell className="text-right">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!canRemove || m.role === "OWNER"}
                  onClick={() => onRemove(m.id)}
                >
                  Remove
                </Button>
              </TableCell>
            </TableRow>
          ))}

          {members.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="py-10 text-center text-sm text-muted-foreground">
                No members found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
