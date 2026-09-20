import { z } from "zod";

const timestampSchema = z.iso.datetime();

export const instructorSchema = z.object({
  id: z.string(),
  name: z.string(),
  bio: z.string().nullable(),
  avatarUrl: z.string().nullable(),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});

export const learningPathModuleSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  position: z.number().int(),
  learningPathId: z.string(),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});

export const learningPathVideoSchema = z.object({
  id: z.string(),
  title: z.string(),
  videoId: z.string(),
  description: z.string().nullable(),
  position: z.number().int(),
  isPublished: z.boolean(),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});

export const certificateSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  templateUrl: z.string().nullable(),
  learningPathId: z.string(),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});

const categorySchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
});

export const learningPathSchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  isPublished: z.boolean(),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
  modules: z.array(learningPathModuleSchema),
  categories: z.array(categorySchema),
  video: learningPathVideoSchema.nullable(),
  certificate: certificateSchema.nullable(),
  instructor: instructorSchema,
});
