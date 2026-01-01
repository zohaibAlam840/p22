import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/requireAuth";
import { requireWorkspaceMember, requireWorkspaceRole } from "@/lib/rbac/workspace.server";
import { resolveWorkspaceIdFromTask } from "@/lib/rbac/resolve";
import { UpdateTaskSchema } from "@/lib/validators/task";
import { publish } from "@/lib/realtime/bus"; // ✅ ADD

async function readParamId(ctx: any): Promise<string | null> {
  const p = ctx?.params;
  if (!p) return null;
  const paramsObj = typeof p?.then === "function" ? await p : p;
  return paramsObj?.id ?? null;
}

function buildUpdateAction(before: any, after: any) {
  const changes: string[] = [];
  if (before.title !== after.title) changes.push("title");
  if (before.description !== after.description) changes.push("description");
  if (before.status !== after.status) changes.push(`status ${before.status} → ${after.status}`);
  if (before.priority !== after.priority) changes.push(`priority ${before.priority} → ${after.priority}`);
  if ((before.dueDate?.toISOString?.() ?? null) !== (after.dueDate?.toISOString?.() ?? null)) changes.push("dueDate");
  if (before.assignedTo !== after.assignedTo) changes.push("assignedTo");

  if (changes.length === 0) return null;
  return `Updated task: ${changes.join(", ")}`;
}

function pick<T extends Record<string, any>>(obj: T, keys: (keyof T)[]) {
  const out: Partial<T> = {};
  for (const k of keys) {
    if (obj[k] !== undefined) out[k] = obj[k];
  }
  return out;
}

export async function PATCH(req: NextRequest, ctx: any) {
  try {
    const userId = await requireAuth(req);
    const taskId = await readParamId(ctx);

    if (!taskId) {
      return NextResponse.json({ error: "Missing route param: id" }, { status: 400 });
    }

    const workspaceId = await resolveWorkspaceIdFromTask(taskId);
    if (!workspaceId) return NextResponse.json({ error: "Task not found" }, { status: 404 });

    const membership = await requireWorkspaceMember(userId, workspaceId);

    const json = await req.json().catch(() => null);
    const parsed = UpdateTaskSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
    }

    const before = await prisma.task.findUnique({
      where: { id: taskId },
      select: {
        id: true,
        projectId: true,
        title: true,
        description: true,
        status: true,
        priority: true,
        dueDate: true,
        assignedTo: true,
      },
    });
    if (!before) return NextResponse.json({ error: "Task not found" }, { status: 404 });

    if (membership.role === "MEMBER" && before.assignedTo !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const requested = parsed.data as any;

    if (membership.role === "MEMBER") {
      if (requested.assignedTo !== undefined || requested.title !== undefined) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const updateData =
      membership.role === "MEMBER"
        ? pick(requested, ["description", "status", "priority", "dueDate"])
        : requested;

    const result = await prisma.$transaction(async (tx: any) => {
      const updated = await tx.task.update({
        where: { id: taskId },
        data: updateData,
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
        },
      });

      const action = buildUpdateAction(before, updated);
      if (action) {
        await tx.activityLog.create({
          data: { taskId, userId, action },
        });
      }

      return updated;
    });

    // ✅ SSE notifications after update
    const oldAssignee = before.assignedTo ?? null;
    const newAssignee = result.assignedTo ?? null;

    // notify assignee changes
    if (oldAssignee !== newAssignee) {
      if (newAssignee) {
        publish(`user:${newAssignee}`, {
          type: "TASK_ASSIGNED",
          taskId: result.id,
          title: result.title,
          projectId: result.projectId,
          byUserId: userId,
        });
      }
      if (oldAssignee) {
        publish(`user:${oldAssignee}`, {
          type: "TASK_UNASSIGNED",
          taskId: result.id,
          title: result.title,
          projectId: result.projectId,
          byUserId: userId,
        });
      }
    } else {
      // notify general updates to current assignee
      if (newAssignee) {
        const action = buildUpdateAction(before, result);
        if (action) {
          publish(`user:${newAssignee}`, {
            type: "TASK_UPDATED",
            taskId: result.id,
            title: result.title,
            projectId: result.projectId,
            message: action,
            byUserId: userId,
          });
        }
      }
    }

    return NextResponse.json({ task: result }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Server error" }, { status: e?.status ?? 500 });
  }
}

export async function DELETE(req: NextRequest, ctx: any) {
  try {
    const userId = await requireAuth(req);
    const taskId = await readParamId(ctx);

    if (!taskId) {
      return NextResponse.json({ error: "Missing route param: id" }, { status: 400 });
    }

    const workspaceId = await resolveWorkspaceIdFromTask(taskId);
    if (!workspaceId) return NextResponse.json({ error: "Task not found" }, { status: 404 });

    await requireWorkspaceRole(userId, workspaceId, ["OWNER", "ADMIN"]);

    // optional: fetch before delete to notify assignee
    const before = await prisma.task.findUnique({
      where: { id: taskId },
      select: { id: true, title: true, projectId: true, assignedTo: true },
    });

    await prisma.task.delete({ where: { id: taskId } });

    if (before?.assignedTo) {
      publish(`user:${before.assignedTo}`, {
        type: "TASK_DELETED",
        taskId: before.id,
        title: before.title,
        projectId: before.projectId,
        byUserId: userId,
      });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Server error" }, { status: e?.status ?? 500 });
  }
}
