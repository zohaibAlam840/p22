import { api } from "./client";

export type ProjectItem = {
  id: string;
  workspaceId: string;
  name: string;
  description?: string | null;
  createdAt: string;
  _count?: { tasks: number };
};

export async function listProjects(workspaceId: string) {
  // expected: GET /api/projects?workspaceId=...
  return api<{ projects: ProjectItem[] }>(`/api/projects?workspaceId=${encodeURIComponent(workspaceId)}`);
}

export async function createProject(input: { workspaceId: string; name: string; description?: string }) {
  return api<{ project: ProjectItem }>("/api/projects", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function getProject(projectId: string) {
  return api<{ project: ProjectItem }>(`/api/projects/${projectId}`);
}

export async function updateProject(projectId: string, input: { name?: string; description?: string | null }) {
  return api<{ project: ProjectItem }>(`/api/projects/${projectId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function deleteProject(projectId: string) {
  return api<{ ok: true }>(`/api/projects/${projectId}`, { method: "DELETE" });
}
