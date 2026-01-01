import { prisma } from "@/lib/db/prisma";

export async function resolveWorkspaceIdFromProject(projectId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { workspaceId: true },
  });
  return project?.workspaceId ?? null;
}

export async function resolveWorkspaceIdFromTask(taskId: string) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: { project: { select: { workspaceId: true } } },
  });
  return task?.project.workspaceId ?? null;
}
