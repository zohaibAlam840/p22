import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/requireAuth";
import { requireWorkspaceMember, requireWorkspaceRole } from "@/lib/rbac/workspace.server";
import { AddMemberSchema } from "@/lib/validators/members";

// Next 15+ safe params typing
type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, ctx: Ctx) {
  try {
    const userId = await requireAuth(req);
    const { id: workspaceId } = await ctx.params;

    // Any workspace member can view member list
    await requireWorkspaceMember(userId, workspaceId);

    const members = await prisma.workspaceMember.findMany({
      where: { workspaceId },
      select: {
        id: true,
        role: true,
        user: { select: { id: true, name: true, email: true, createdAt: true } },
      },
      // WorkspaceMember model doesn't have createdAt in your schema,
      // so order by something that exists:
      orderBy: { role: "asc" }, // or: { id: "asc" }
    });

    return NextResponse.json({ members }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Server error" },
      { status: e?.status ?? 500 }
    );
  }
}

export async function POST(req: NextRequest, ctx: Ctx) {
  try {
    const userId = await requireAuth(req);
    const { id: workspaceId } = await ctx.params;

    // Only OWNER/ADMIN can add members
    await requireWorkspaceRole(userId, workspaceId, ["OWNER", "ADMIN"]);

    const json = await req.json().catch(() => null);
    const parsed = AddMemberSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { email, role } = parsed.data;
    const finalRole = role ?? "MEMBER";

    const userToAdd = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true },
    });

    if (!userToAdd) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prevent duplicates
    const existing = await prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId: userToAdd.id } },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json({ error: "User is already a member" }, { status: 409 });
    }

    const member = await prisma.workspaceMember.create({
      data: {
        workspaceId,
        userId: userToAdd.id,
        role: finalRole,
      },
      select: {
        id: true,
        role: true,
        user: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json({ member }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Server error" },
      { status: e?.status ?? 500 }
    );
  }
}
