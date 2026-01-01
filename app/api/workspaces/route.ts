import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/requireAuth";
import { CreateWorkspaceSchema } from "@/lib/validators/workspace";
import { Prisma } from "@prisma/client";


export async function POST(req: NextRequest) {
  try {
    const userId = await requireAuth(req);

    const json = await req.json().catch(() => null);
    const parsed = CreateWorkspaceSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { name } = parsed.data;

    // Create workspace + add creator as OWNER in a transaction
    const workspace = await prisma.$transaction(async (tx: any) => {
      const ws = await tx.workspace.create({
        data: {
          name,
          createdBy: userId,
          members: {
            create: { userId, role: "OWNER" },
          },
        },
        select: { id: true, name: true, createdAt: true, createdBy: true },
      });

      return ws;
    });

    return NextResponse.json({ workspace }, { status: 201 });
  } catch (e: any) {
    // If you added @@unique([createdBy, name]) in Workspace, Prisma throws P2002 on duplicates
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return NextResponse.json(
        { error: "Workspace name already exists. Choose a different name." },
        { status: 409 }
      );
    }

    const status = e?.status ?? 500;
    return NextResponse.json({ error: e?.message ?? "Server error" }, { status });
  }
}

export async function GET(req: NextRequest) {
  try {
    const userId = await requireAuth(req);

    const memberships = await prisma.workspaceMember.findMany({
      where: { userId },
      select: {
        role: true,
        workspace: {
          select: {
            id: true,
            name: true,
            createdAt: true,
            createdBy: true,
            _count: { select: { projects: true, members: true } },
          },
        },
      },
      orderBy: { workspace: { createdAt: "desc" } },
    });

    const workspaces = memberships.map((m) => ({
      ...m.workspace,
      myRole: m.role,
    }));

    return NextResponse.json({ workspaces }, { status: 200 });
  } catch (e: any) {
    const status = e?.status ?? 500;
    return NextResponse.json({ error: e?.message ?? "Server error" }, { status });
  }
}
