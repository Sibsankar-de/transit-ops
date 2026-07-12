import { z } from "zod";
import { paginationQuerySchema, sortOrderSchema } from "./pagination.schema";
import { UserStatus } from "../enums/userStatus.enum";

export const createUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.email("Invalid email address"),
});

export const loginSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const updateUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
});

export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

const userSortFields = ["createdAt", "name", "email"] as const;

export const listUsersQuerySchema = paginationQuerySchema.extend({
  search: z.string().optional(),
  status: z.nativeEnum(UserStatus).optional(),
  roleId: z.string().uuid("Invalid role ID").optional(),
  sortBy: z.enum(userSortFields).default("createdAt"),
  sortOrder: sortOrderSchema,
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;
export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;
