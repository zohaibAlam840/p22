import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/requireAuth";
import { requireWorkspaceMember, requireWorkspaceRole } from "@/lib/rbac/workspace.server";


async function readParamId(ctx: any): Promise<string | null> {
  const p = ctx?.params;
  if (!p) return null;

  const obj = typeof p?.then === "function" ? await p : p;
  return obj?.id ?? null;
}

export async function GET(req: NextRequest, ctx: any) {
  try {
    const userId = await requireAuth(req);
    const workspaceId = await readParamId(ctx);

    if (!workspaceId) {
      return NextResponse.json(
        { error: "Missing route param: id (ensure route is /api/workspaces/[id]/route.ts)" },
        { status: 400 }
      );
    }

    const membership = await requireWorkspaceMember(userId, workspaceId);

    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: {
        id: true,
        name: true,
        createdAt: true,
        createdBy: true,
        members: {
          select: {
            id: true,
            role: true,
            user: { select: { id: true, name: true, email: true, createdAt: true } },
          },
          orderBy: [{ role: "asc" }], 
        },
        projects: {
          select: { id: true, name: true, description: true, createdAt: true },
          orderBy: [{ createdAt: "desc" }],
        },
      },
    });

    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    return NextResponse.json({ workspace, myRole: membership.role }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Server error" },
      { status: e?.status ?? 500 }
    );
  }
}

export async function DELETE(req: NextRequest, ctx: any) {
  try {
    const userId = await requireAuth(req);
    const workspaceId = await readParamId(ctx);

    if (!workspaceId) {
      return NextResponse.json(
        { error: "Missing route param: id (ensure route is /api/workspaces/[id]/route.ts)" },
        { status: 400 }
      );
    }

    await requireWorkspaceRole(userId, workspaceId, ["OWNER"]);


    await prisma.workspace.delete({ where: { id: workspaceId } });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Server error" },
      { status: e?.status ?? 500 }
    );
  }
}
