import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/requireAuth";
import { requireWorkspaceRole } from "@/lib/rbac/workspace.server";
import { UpdateMemberRoleSchema } from "@/lib/validators/members";

// Must match folder name: app/api/workspaces/[id]/members/[membersId]/route.ts
type Ctx = { params: Promise<{ id: string; membersId: string }> };

async function countOwners(workspaceId: string) {
  return prisma.workspaceMember.count({
    where: { workspaceId, role: "OWNER" },
  });
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  try {
    const userId = await requireAuth(req);
    const { id: workspaceId, membersId } = await ctx.params;
    const memberId = membersId; // alias to keep the rest unchanged

    // OWNER only can change roles
    await requireWorkspaceRole(userId, workspaceId, ["OWNER"]);

    const json = await req.json().catch(() => null);
    const parsed = UpdateMemberRoleSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const desiredRole = parsed.data.role;

    const target = await prisma.workspaceMember.findFirst({
      where: { id: memberId, workspaceId },
      select: { id: true, role: true, userId: true },
    });

    if (!target) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    // If demoting an OWNER, ensure there's another OWNER
    if (target.role === "OWNER" && desiredRole !== "OWNER") {
      const owners = await countOwners(workspaceId);
      if (owners <= 1) {
        return NextResponse.json({ error: "Cannot demote the last OWNER" }, { status: 409 });
      }
    }

    const updated = await prisma.workspaceMember.update({
      where: { id: target.id },
      data: { role: desiredRole },
      select: {
        id: true,
        role: true,
        user: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json({ member: updated }, { status: 200 });
  } catch (e: any) {
    const status = e?.status ?? 500;
    return NextResponse.json({ error: e?.message ?? "Server error" }, { status });
  }
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  try {
    const userId = await requireAuth(req);
    const { id: workspaceId, membersId } = await ctx.params;
    const memberId = membersId; // alias to keep the rest unchanged

    // OWNER/ADMIN can remove members
    await requireWorkspaceRole(userId, workspaceId, ["OWNER", "ADMIN"]);

    const target = await prisma.workspaceMember.findFirst({
      where: { id: memberId, workspaceId },
      select: { id: true, role: true, userId: true },
    });

    if (!target) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    // Prevent deleting the last OWNER
    if (target.role === "OWNER") {
      const owners = await countOwners(workspaceId);
      if (owners <= 1) {
        return NextResponse.json({ error: "Cannot remove the last OWNER" }, { status: 409 });
      }
    }

    await prisma.workspaceMember.delete({ where: { id: target.id } });
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    const status = e?.status ?? 500;
    return NextResponse.json({ error: e?.message ?? "Server error" }, { status });
  }
}
