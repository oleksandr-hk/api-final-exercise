import { z } from "zod";

export const promoCodeSchema = z.object({
  id: z.string(),
  code: z.string(),
  courseId: z.string(),
  discountPercent: z.number().int(),
  maxUses: z.number().int().nullable(),
  currentUses: z.number().int(),
  expiresAt: z.iso.datetime(),
  isActive: z.boolean(),
  createdAt: z.iso.datetime(),
  _count: z.object({ usages: z.number().int() }).optional(),
});

export const validatePromoCodeSchema = z.discriminatedUnion("valid", [
  z.object({
    valid: z.literal(true),
    discountPercent: z.number(),
    originalPrice: z.number(),
    finalPrice: z.number(),
  }),
  z.object({ valid: z.literal(false), error: z.string() }),
]);
