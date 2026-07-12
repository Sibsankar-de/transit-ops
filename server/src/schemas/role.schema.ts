import { z } from "zod";
import { permissionValues } from "../enums/permission.enum";
import { paginationQuerySchema } from "./pagination.schema";

export const createRoleSchema = z.object({
  name: z.string().min(2, "Role name must be at least 2 characters"),
  permissions: z
    .array(z.enum(permissionValues))
    .min(1, "At least one permission is required"),
});

export const updateRoleSchema = z.object({
  name: z.string().min(2, "Role name must be at least 2 characters").optional(),
  permissions: z.array(z.enum(permissionValues)).min(1).optional(),
});

export type CreateRoleInput = z.infer<typeof createRoleSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;

export const listRolesQuerySchema = paginationQuerySchema;
export type ListRolesQuery = z.infer<typeof listRolesQuerySchema>;
