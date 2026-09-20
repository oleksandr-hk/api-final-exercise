import { z } from "zod";

export const postSchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  excerpt: z.string().nullable().optional(),
  content: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  isPublished: z.boolean(),
  publishedAt: z.string().nullable(),
  createdAt: z.iso.datetime(),
  tags: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        slug: z.string().optional(),
      }),
    )
    .optional(),
});