import { api } from "./client";
import type { TaskPriority, TaskStatus } from "./tasks";

export type AssignedTaskItem = {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string | null;
  createdAt: string;
  project: {
    id: string;
    name: string;
    workspace: { id: string; name: string };
  };
};

export async function listAssignedTasks(filters: { status?: TaskStatus; priority?: TaskPriority } = {}) {
  const qs = new URLSearchParams();
  if (filters.status) qs.set("status", filters.status);
  if (filters.priority) qs.set("priority", filters.priority);

  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  return api<{ tasks: AssignedTaskItem[] }>(`/api/tasks/assigned${suffix}`);
}
