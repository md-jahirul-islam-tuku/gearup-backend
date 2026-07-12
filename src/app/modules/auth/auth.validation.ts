import { z } from "zod";

export const registerValidationSchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(3, "Name must be at least 3 characters")
      .max(255, "Name cannot exceed 255 characters"),

    email: z.email("Invalid email address"),

    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(20, "Password cannot exceed 20 characters"),

    role: z.enum(["CUSTOMER", "PROVIDER"]),
  }),
});

export const loginValidationSchema = z.object({
  body: z.object({
    email: z.email("Invalid email address"),

    password: z.string().min(1, "Password is required"),
  }),
});
