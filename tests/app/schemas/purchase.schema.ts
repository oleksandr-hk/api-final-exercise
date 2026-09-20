import { z } from "zod";

const purchasedCourseSchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  imageUrl: z.string().nullable(),
});

export const purchaseSchema = z.object({
  id: z.string(),
  userId: z.string(),
  courseId: z.string(),
  amount: z.string(),
  promoCode: z.string().nullable(),
  course: purchasedCourseSchema.optional(),
  createdAt: z.iso.datetime(),
});
