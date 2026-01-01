import { z } from "zod";

export const CreateProjectSchema = z.object({
  workspaceId: z.string().min(1),
  name: z.string().min(2).max(120),
  description: z.string().max(1000).optional().nullable(),
});

export const UpdateProjectSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  description: z.string().max(1000).optional().nullable(),
});
