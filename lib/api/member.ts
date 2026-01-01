import { api } from "./client";
import type { WorkspaceRole } from "@/lib/rbac/workspace";

export type MemberItem = {
  id: string;
  userId: string;
  role: WorkspaceRole;
  user: { id: string; name: string; email: string };
};

export async function listMembers(workspaceId: string) {
  return api<{ members: MemberItem[] }>(`/api/workspaces/${workspaceId}/members`);
}

export async function inviteMember(workspaceId: string, input: { email: string; role?: WorkspaceRole }) {
  return api<{ member: MemberItem }>(`/api/workspaces/${workspaceId}/members`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateMemberRole(workspaceId: string, memberId: string, role: WorkspaceRole) {
  return api<{ member: MemberItem }>(`/api/workspaces/${workspaceId}/members/${memberId}`, {
    method: "PATCH",
    body: JSON.stringify({ role }),
  });
}

export async function removeMember(workspaceId: string, memberId: string) {
  return api<{ ok: true }>(`/api/workspaces/${workspaceId}/members/${memberId}`, { method: "DELETE" });
}
