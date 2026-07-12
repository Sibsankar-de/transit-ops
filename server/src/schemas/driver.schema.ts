import { z } from "zod";
import { DriverStatus } from "../enums/driverStatus.enum";
import { paginationQuerySchema, sortOrderSchema } from "./pagination.schema";

export const createDriverSchema = z.object({
  userId: z.uuid("Invalid userId"),
  licenseNumber: z.string().min(1, "License number is required"),
  licenseCategory: z.string().min(1, "License category is required"),
  licenseExpiryDate: z.coerce.date({ message: "Invalid expiry date" }),
});

export const updateDriverSchema = z.object({
  licenseNumber: z.string().min(1, "License number is required").optional(),
  licenseCategory: z.string().min(1, "License category is required").optional(),
  licenseExpiryDate: z.coerce
    .date({ message: "Invalid expiry date" })
    .optional(),
  safetyScore: z
    .number()
    .min(0, "Safety score cannot be negative")
    .max(100, "Safety score cannot exceed 100")
    .optional(),
  status: z
    .enum(Object.values(DriverStatus) as [string, ...string[]])
    .optional(),
});

export type CreateDriverInput = z.infer<typeof createDriverSchema>;
export type UpdateDriverInput = z.infer<typeof updateDriverSchema>;

const driverSortFields = [
  "createdAt",
  "licenseExpiryDate",
  "safetyScore",
] as const;

export const listDriversQuerySchema = paginationQuerySchema.extend({
  search: z.string().optional(),
  status: z
    .enum(Object.values(DriverStatus) as [string, ...string[]])
    .optional(),
  licenseCategory: z.string().optional(),
  sortBy: z.enum(driverSortFields).default("createdAt"),
  sortOrder: sortOrderSchema,
});

export type ListDriversQuery = z.infer<typeof listDriversQuerySchema>;
