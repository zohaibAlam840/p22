import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/requireAuth";
import { requireWorkspaceMember, requireWorkspaceRole } from "@/lib/rbac/workspace.server";
import { resolveWorkspaceIdFromProject } from "@/lib/rbac/resolve";
import { CreateTaskSchema } from "@/lib/validators/task";
import { publish } from "@/lib/realtime/bus"; 

export async function POST(req: NextRequest) {
  try {
    const userId = await requireAuth(req);

    const json = await req.json().catch(() => null);
    const parsed = CreateTaskSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
    }

    const { projectId, title, description, status, priority, dueDate, assignedTo } = parsed.data;

    const workspaceId = await resolveWorkspaceIdFromProject(projectId);
    if (!workspaceId) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    await requireWorkspaceMember(userId, workspaceId);
    await requireWorkspaceRole(userId, workspaceId, ["OWNER", "ADMIN"]);

    const task = await prisma.$transaction(async (tx: any) => {
      const created = await tx.task.create({
        data: {
          projectId,
          title,
          description: description ?? null,
          status: status ?? undefined,
          priority: priority ?? undefined,
          dueDate: dueDate ?? undefined,
          assignedTo: assignedTo ?? null,
        },
        select: {
          id: true,
          projectId: true,
          title: true,
          description: true,
          status: true,
          priority: true,
          dueDate: true,
          assignedTo: true,
          createdAt: true,
          assignee: { select: { id: true, name: true, email: true } },
        },
      });

      await tx.activityLog.create({
        data: { taskId: created.id, userId, action: "Created task" },
      });

      return created;
    });

    // ✅ SSE notification if assigned on create
    if (task.assignedTo) {
      publish(`user:${task.assignedTo}`, {
        type: "TASK_ASSIGNED",
        taskId: task.id,
        title: task.title,
        projectId: task.projectId,
        byUserId: userId,
      });
    }

    return NextResponse.json({ task }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Server error" }, { status: e?.status ?? 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const userId = await requireAuth(req);

    const projectId = req.nextUrl.searchParams.get("projectId");
    if (!projectId) return NextResponse.json({ error: "Missing query param: projectId" }, { status: 400 });

    const workspaceId = await resolveWorkspaceIdFromProject(projectId);
    if (!workspaceId) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    await requireWorkspaceMember(userId, workspaceId);

    const status = req.nextUrl.searchParams.get("status") as any;
    const priority = req.nextUrl.searchParams.get("priority") as any;
    const assignedTo = req.nextUrl.searchParams.get("assignedTo");

    const where: any = { projectId };
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (assignedTo) where.assignedTo = assignedTo;

    const tasks = await prisma.task.findMany({
      where,
      select: {
        id: true,
        projectId: true,
        title: true,
        description: true,
        status: true,
        priority: true,
        dueDate: true,
        assignedTo: true,
        createdAt: true,
        assignee: { select: { id: true, name: true, email: true } },
      },
      orderBy: [{ createdAt: "desc" }],
    });

    return NextResponse.json({ tasks }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Server error" }, { status: e?.status ?? 500 });
  }
}
