import { z } from "zod";

const categorySchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
});

export const courseSchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  imageUrl: z.string().nullable(),
  price: z.string().nullable(),
  isPublished: z.boolean(),
  isListed: z.boolean(),
  isFeatured: z.boolean(),
  featuredOrder: z.number().int(),
  outcomes: z.string().nullable(),
  requirements: z.string().nullable(),
  authorName: z.string().nullable(),
  authorRole: z.string().nullable(),
  categories: z.array(categorySchema).optional(),
  chapters: z.array(z.object({ id: z.string() }).loose()).optional(),
  attachments: z.array(z.object({ id: z.string() }).loose()).optional(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});
