import { z } from "zod";

export const createGearValidationSchema = z.object({
  body: z.object({
    name: z.string().min(3).max(150),

    description: z.string().min(20),

    brand: z.string().min(2),

    pricePerDay: z.number().positive(),

    stock: z.number().int().min(0),

    categoryId: z.uuid(),

    images: z.array(z.url()).min(1),
  }),
});
