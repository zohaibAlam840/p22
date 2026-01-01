import { api } from "./client";

export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";

export type TaskItem = {
  id: string;
  projectId: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string | null;
  assignedTo?: string | null;
  createdAt: string;
  assignee?: { id: string; name: string; email: string } | null;
};

export type TaskLog = {
  id: string;
  action: string;
  createdAt: string;
  user: { id: string; name: string; email: string };
};

export type TaskFilters = {
  status?: TaskStatus;
  priority?: TaskPriority;
  assignedTo?: string;
};

export async function listTasks(projectId: string, filters: TaskFilters = {}) {
  const qs = new URLSearchParams({ projectId });
  if (filters.status) qs.set("status", filters.status);
  if (filters.priority) qs.set("priority", filters.priority);
  if (filters.assignedTo) qs.set("assignedTo", filters.assignedTo);

  return api<{ tasks: TaskItem[] }>(`/api/tasks?${qs.toString()}`);
}

export async function createTask(input: {
  projectId: string;
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string | null;
  assignedTo?: string | null;
}) {
  return api<{ task: TaskItem }>("/api/tasks", { method: "POST", body: JSON.stringify(input) });
}

export async function updateTask(taskId: string, input: Partial<Omit<TaskItem, "id" | "createdAt" | "projectId" | "assignee">>) {
  return api<{ task: TaskItem }>(`/api/tasks/${taskId}`, { method: "PATCH", body: JSON.stringify(input) });
}

export async function deleteTask(taskId: string) {
  return api<{ ok: true }>(`/api/tasks/${taskId}`, { method: "DELETE" });
}

export async function listTaskLogs(taskId: string) {
  return api<{ logs: TaskLog[] }>(`/api/tasks/${taskId}/logs`);
}
