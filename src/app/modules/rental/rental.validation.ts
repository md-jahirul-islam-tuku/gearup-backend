import { z } from "zod";

export const createRentalValidationSchema = z.object({
  body: z.object({
    gearItemId: z.string().uuid(),
    quantity: z.number().int().positive(),

    startDate: z.string().date(),
    endDate: z.string().date(),
  }),
});
