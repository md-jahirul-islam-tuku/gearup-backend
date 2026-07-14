import { z } from "zod";
import { RentalStatus } from "../../../../generated/prisma/enums";

export const createRentalValidationSchema = z.object({
  body: z.object({
    gearItemId: z.string().uuid(),
    quantity: z.number().int().positive(),

    startDate: z.string().date(),
    endDate: z.string().date(),
  }),
});

export const updateRentalStatusValidationSchema = z.object({
  body: z.object({
    status: z.enum([
      RentalStatus.CONFIRMED,
      RentalStatus.PICKED_UP,
      RentalStatus.RETURNED,
      RentalStatus.CANCELLED,
    ]),
  }),
});
