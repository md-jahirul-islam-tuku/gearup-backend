import { z } from "zod";

export const createCategoryValidationSchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(2, "Category name must be at least 2 characters")
      .max(100, "Category name cannot exceed 100 characters"),

    description: z
      .string()
      .trim()
      .max(500, "Description cannot exceed 500 characters")
      .optional(),
  }),
});
export const updateCategoryValidationSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(100).optional(),

    description: z.string().trim().max(500).optional(),
  }),
});
