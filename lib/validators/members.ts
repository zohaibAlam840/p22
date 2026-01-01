import { z } from "zod";

export const AddMemberSchema = z.object({
  email: z.string().email().max(255),
  role: z.enum(["OWNER", "ADMIN", "MEMBER"]).optional(), // default MEMBER
});

export const UpdateMemberRoleSchema = z.object({
  role: z.enum(["OWNER", "ADMIN", "MEMBER"]),
});
