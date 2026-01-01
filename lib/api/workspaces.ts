import { api } from "./client";
import type { WorkspaceRole } from "@/lib/rbac/workspace";

export type WorkspaceListItem = {
  id: string;
  name: string;
  createdAt: string;
  createdBy: string;
  myRole: WorkspaceRole;
  _count?: { projects: number; members: number };
};

export async function listWorkspaces() {
  return api<{ workspaces: WorkspaceListItem[] }>("/api/workspaces");
}

export async function createWorkspace(input: { name: string }) {
  return api<{ workspace: WorkspaceListItem }>("/api/workspaces", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function getWorkspace(workspaceId: string) {
  return api<{ workspace: { id: string; name: string }; myRole: WorkspaceRole }>(
    `/api/workspaces/${workspaceId}`
  );
}

/** OWNER only (server enforces) */
export async function deleteWorkspace(workspaceId: string) {
  return api<{ ok: true }>(`/api/workspaces/${workspaceId}`, { method: "DELETE" });
}
