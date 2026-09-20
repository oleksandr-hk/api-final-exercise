import { z } from "zod";

export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.email(),
  role: z.enum(["USER", "ADMIN"]),
  isActive: z.boolean().optional(),
  createdAt: z.iso.datetime(),
});
