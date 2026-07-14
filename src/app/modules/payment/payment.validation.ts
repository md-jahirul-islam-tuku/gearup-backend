import { z } from "zod";

export const createCheckoutSessionValidationSchema = z.object({
  body: z.object({
    rentalId: z.string().uuid("Invalid rental id"),
  }),
});
