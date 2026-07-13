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

export const updateGearValidationSchema = z.object({
  body: z.object({
    name: z.string().trim().min(3).max(150).optional(),
    description: z.string().trim().min(20).optional(),
    brand: z.string().trim().min(2).max(100).optional(),
    pricePerDay: z.number().positive().optional(),
    stock: z.number().int().min(0).optional(),
    categoryId: z.string().uuid().optional(),
    images: z.array(z.string().url()).optional(),
  }),
});
