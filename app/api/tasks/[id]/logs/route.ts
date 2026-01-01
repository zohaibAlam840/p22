import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/requireAuth";
import { requireWorkspaceMember } from "@/lib/rbac/workspace.server";
import { resolveWorkspaceIdFromTask } from "@/lib/rbac/resolve";

// Works for both Next styles: params as object OR params as Promise
async function readParamId(ctx: any): Promise<string | null> {
  const p = ctx?.params;
  if (!p) return null;

  const paramsObj = typeof p?.then === "function" ? await p : p;
  return paramsObj?.id ?? null;
}

export async function GET(req: NextRequest, ctx: any) {
  try {
    const userId = await requireAuth(req);
    const taskId = await readParamId(ctx);

    if (!taskId) {
      return NextResponse.json(
        { error: "Missing route param: id (ensure route is /api/tasks/[id]/logs)" },
        { status: 400 }
      );
    }

    const workspaceId = await resolveWorkspaceIdFromTask(taskId);
    if (!workspaceId) return NextResponse.json({ error: "Task not found" }, { status: 404 });

    await requireWorkspaceMember(userId, workspaceId);

    const logs = await prisma.activityLog.findMany({
      where: { taskId },
      select: {
        id: true,
        action: true,
        createdAt: true,
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ logs }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Server error" },
      { status: e?.status ?? 500 }
    );
  }
}
