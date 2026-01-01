import type { WorkspaceRole } from "@/lib/rbac/permissions";
import { rolePerms } from "@/lib/rbac/permissions";

export function can(role: WorkspaceRole, perm: keyof typeof rolePerms.OWNER) {
  return !!rolePerms[role]?.[perm];
}

export function canEditTask(role: WorkspaceRole, assignedTo: string | null, meId: string) {
  if (role === "OWNER" || role === "ADMIN") return true;
  return assignedTo === meId;
}
