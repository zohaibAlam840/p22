import "dotenv/config";
import { prisma } from "@/lib/db/prisma"; // adjust import to your actual path
import bcrypt from "bcryptjs";

async function main() {
  await prisma.activityLog.deleteMany();
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.workspaceMember.deleteMany();
  await prisma.workspace.deleteMany();
  await prisma.user.deleteMany();

  const hashed = await bcrypt.hash("password", 12);

  const owner = await prisma.user.create({
    data: { email: "owner@example.com", name: "Owner User", password: hashed },
  });

  const admin = await prisma.user.create({
    data: { email: "admin@example.com", name: "Admin User", password: hashed },
  });

  const member = await prisma.user.create({
    data: { email: "member@example.com", name: "Member User", password: hashed },
  });

  const ws = await prisma.workspace.create({
    data: { name: "Demo Workspace", createdBy: owner.id },
  });

  await prisma.workspaceMember.createMany({
    data: [
      { workspaceId: ws.id, userId: owner.id, role: "OWNER" },
      { workspaceId: ws.id, userId: admin.id, role: "ADMIN" },
      { workspaceId: ws.id, userId: member.id, role: "MEMBER" },
    ],
  });

  const proj = await prisma.project.create({
    data: { workspaceId: ws.id, name: "Demo Project", description: "Seeded project for testing." },
  });

  const t1 = await prisma.task.create({
    data: {
      projectId: proj.id,
      title: "Set up workspace structure",
      description: "Workspaces → Projects → Tasks",
      status: "TODO",
      priority: "HIGH",
      assignedTo: member.id,
    },
  });

  const t2 = await prisma.task.create({
    data: {
      projectId: proj.id,
      title: "Implement RBAC checks",
      description: "OWNER/ADMIN vs MEMBER rules",
      status: "IN_PROGRESS",
      priority: "MEDIUM",
      assignedTo: admin.id,
    },
  });

  await prisma.activityLog.createMany({
    data: [
      { taskId: t1.id, userId: owner.id, action: "Created task" },
      { taskId: t2.id, userId: owner.id, action: "Created task" },
    ],
  });

  console.log("Seed completed:");
  console.log("- owner@example.com / password");
  console.log("- admin@example.com / password");
  console.log("- member@example.com / password");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
