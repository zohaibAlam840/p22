import { z } from "zod";

const dateOrNull = z.preprocess((val) => {
  if (val === null || val === undefined || val === "") return null;
  if (val instanceof Date) return val;
  if (typeof val === "string") return new Date(val);
  return val;
}, z.date().nullable());

export const CreateTaskSchema = z.object({
  projectId: z.string().min(1),
  title: z.string().min(2).max(200),
  description: z.string().max(2000).optional().nullable(),

  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),

  dueDate: dateOrNull.optional(),
  assignedTo: z.string().min(1).optional().nullable(),
});

export const UpdateTaskSchema = z.object({
  title: z.string().min(2).max(200).optional(),
  description: z.string().max(2000).optional().nullable(),

  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),

  dueDate: dateOrNull.optional(),
  assignedTo: z.string().min(1).optional().nullable(),
});
