import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/requireAuth";
import { requireWorkspaceMember, requireWorkspaceRole } from "@/lib/rbac/workspace.server";
import { UpdateProjectSchema } from "@/lib/validators/project";
import { getParam } from "@/lib/next/getParams";

export async function GET(req: NextRequest, ctx: any) {
  try {
    const userId = await requireAuth(req);
    const projectId = await getParam(ctx, "id");

    if (!projectId) {
      return NextResponse.json({ error: "Missing route param: id" }, { status: 400 });
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, workspaceId: true, name: true, description: true, createdAt: true },
    });

    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    await requireWorkspaceMember(userId, project.workspaceId);
    return NextResponse.json({ project }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Server error" }, { status: e?.status ?? 500 });
  }
}

export async function PATCH(req: NextRequest, ctx: any) {
  try {
    const userId = await requireAuth(req);
    const projectId = await getParam(ctx, "id");

    if (!projectId) {
      return NextResponse.json({ error: "Missing route param: id" }, { status: 400 });
    }

    const existing = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, workspaceId: true },
    });
    if (!existing) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    await requireWorkspaceRole(userId, existing.workspaceId, ["OWNER", "ADMIN"]);

    const json = await req.json().catch(() => null);
    const parsed = UpdateProjectSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
    }

    const updated = await prisma.project.update({
      where: { id: projectId },
      data: {
        ...(parsed.data.name !== undefined ? { name: parsed.data.name } : {}),
        ...(parsed.data.description !== undefined ? { description: parsed.data.description } : {}),
      },
      select: { id: true, workspaceId: true, name: true, description: true, createdAt: true },
    });

    return NextResponse.json({ project: updated }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Server error" }, { status: e?.status ?? 500 });
  }
}

export async function DELETE(req: NextRequest, ctx: any) {
  try {
    const userId = await requireAuth(req);
    const projectId = await getParam(ctx, "id");

    if (!projectId) {
      return NextResponse.json({ error: "Missing route param: id" }, { status: 400 });
    }

    const existing = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, workspaceId: true },
    });
    if (!existing) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    await requireWorkspaceRole(userId, existing.workspaceId, ["OWNER", "ADMIN"]);

    await prisma.project.delete({ where: { id: projectId } });
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Server error" }, { status: e?.status ?? 500 });
  }
}
