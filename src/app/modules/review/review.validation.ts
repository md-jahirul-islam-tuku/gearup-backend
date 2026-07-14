import { z } from "zod";

export const createReviewValidationSchema = z.object({
  body: z.object({
    rentalOrderId: z.string().uuid(),

    rating: z.number().int().min(1).max(5),

    comment: z.string().trim().min(5).max(500),
  }),
});
