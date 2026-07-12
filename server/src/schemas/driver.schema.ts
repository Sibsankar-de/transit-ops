import { z } from "zod";
import { DriverStatus } from "../enums/driverStatus.enum";
import { paginationQuerySchema } from "./pagination.schema";

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
  status: z.enum(DriverStatus).optional(),
});

export type CreateDriverInput = z.infer<typeof createDriverSchema>;
export type UpdateDriverInput = z.infer<typeof updateDriverSchema>;

export const listDriversQuerySchema = paginationQuerySchema;
export type ListDriversQuery = z.infer<typeof listDriversQuerySchema>;
