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

export const updateProfileValidationSchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name cannot exceed 100 characters")
      .optional(),

    profileImage: z.url("Profile image must be a valid URL").optional(),
  }),
});

export const changePasswordValidationSchema = z.object({
  body: z.object({
    oldPassword: z
      .string()
      .min(6, "Old password must be at least 6 characters"),

    newPassword: z
      .string()
      .min(6, "New password must be at least 6 characters")
      .max(100, "New password cannot exceed 100 characters"),
  }),
});
