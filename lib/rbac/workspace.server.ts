import "server-only";
import { prisma } from "@/lib/db/prisma";
import type { WorkspaceRole } from "@/lib/rbac/workspace";

export async function getWorkspaceMembership(userId: string, workspaceId: string) {
  return prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId } },
    select: { id: true, role: true, workspaceId: true, userId: true },
  });
}

export async function requireWorkspaceMember(userId: string, workspaceId: string) {
  const m = await getWorkspaceMembership(userId, workspaceId);
  if (!m) {
    const err = new Error("Forbidden");
    // @ts-expect-error attach http status
    err.status = 403;
    throw err;
  }
  return m;
}

export async function requireWorkspaceRole(
  userId: string,
  workspaceId: string,
  allowed: WorkspaceRole[]
) {
  const m = await requireWorkspaceMember(userId, workspaceId);
  if (!allowed.includes(m.role)) {
    const err = new Error("Forbidden");
    // @ts-expect-error attach http status
    err.status = 403;
    throw err;
  }
  return m;
}
