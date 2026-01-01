import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/requireAuth";
import { requireWorkspaceMember, requireWorkspaceRole } from "@/lib/rbac/workspace.server";
import { CreateProjectSchema } from "@/lib/validators/project";

export async function POST(req: NextRequest) {
  try {
    const userId = await requireAuth(req);

    const json = await req.json().catch(() => null);
    const parsed = CreateProjectSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
    }

    const { workspaceId, name, description } = parsed.data;

    // Only ADMIN/OWNER can create projects (recommended RBAC)
    await requireWorkspaceRole(userId, workspaceId, ["OWNER", "ADMIN"]);

    const project = await prisma.project.create({
      data: { workspaceId, name, description: description ?? null },
      select: { id: true, workspaceId: true, name: true, description: true, createdAt: true },
    });

    return NextResponse.json({ project }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Server error" }, { status: e?.status ?? 500 });
  }
}

// export async function GET(req: NextRequest) {
//   try {
//     const userId = await requireAuth(req);
//     const workspaceId = req.nextUrl.searchParams.get("workspace");
//     if (!workspaceId) {
//       return NextResponse.json({ error: "Missing query param: workspace" }, { status: 400 });
//     }

//     await requireWorkspaceMember(userId, workspaceId);

//     const projects = await prisma.project.findMany({
//       where: { workspaceId },
//       select: { id: true, workspaceId: true, name: true, description: true, createdAt: true, _count: { select: { tasks: true } } },
//       orderBy: { createdAt: "desc" },
//     });

//     return NextResponse.json({ projects }, { status: 200 });
//   } catch (e: any) {
//     return NextResponse.json({ error: e?.message ?? "Server error" }, { status: e?.status ?? 500 });
//   }
// }


export async function GET(req: NextRequest) {
  try {
    const userId = await requireAuth(req);

    const workspaceId = req.nextUrl.searchParams.get("workspaceId");
    if (!workspaceId) {
      return NextResponse.json({ error: "Missing query param: workspaceId" }, { status: 400 });
    }

    await requireWorkspaceMember(userId, workspaceId);

    const projects = await prisma.project.findMany({
      where: { workspaceId },
      select: {
        id: true,
        workspaceId: true,
        name: true,
        description: true,
        createdAt: true,
        _count: { select: { tasks: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ projects }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Server error" }, { status: e?.status ?? 500 });
  }
}
