import { z } from "zod";
import { brazilianPhoneSchema, cpfSchema } from "./common";

export const registerSchema = z
  .object({
    name: z.string().min(3, "Name must be at least 3 characters").max(120),
    email: z.string().email("Invalid email"),
    cpf: cpfSchema,
    phone: brazilianPhoneSchema,
    password: z.string().min(8, "Password must be at least 8 characters").max(128),
    confirmPassword: z.string(),
    isStudent: z.boolean().default(true),
    isMentor: z.boolean().default(false),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

export const profileUpdateSchema = z.object({
  name: z.string().min(3).max(120).optional(),
  phone: brazilianPhoneSchema.optional(),
  avatarUrl: z.string().url().optional(),
});

export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "New password must be at least 8 characters").max(128),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const passwordResetRequestSchema = z.object({
  email: z.string().email("Invalid email"),
});

export const passwordResetSchema = z
  .object({
    token: z.string().min(1, "Token is required"),
    newPassword: z.string().min(8, "New password must be at least 8 characters").max(128),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const emailVerificationSchema = z.object({
  token: z.string().min(1, "Token is required"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
export type PasswordChangeInput = z.infer<typeof passwordChangeSchema>;
