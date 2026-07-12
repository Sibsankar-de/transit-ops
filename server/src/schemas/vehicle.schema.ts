import { z } from "zod";
import { VehicleStatus } from "../enums/vehicleStatus.enum";
import { paginationQuerySchema, sortOrderSchema } from "./pagination.schema";

export const createVehicleSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.string().min(1, "Type is required"),
  maxLoadCapacity: z.number().positive("Max load capacity must be positive"),
  odometer: z.number().nonnegative("Odometer must be non-negative").default(0),
  acquisitionCost: z
    .number()
    .nonnegative("Acquisition cost must be non-negative"),
  region: z.string().min(1, "Region is required"),
});

export const updateVehicleSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  type: z.string().min(1, "Type is required").optional(),
  maxLoadCapacity: z
    .number()
    .positive("Max load capacity must be positive")
    .optional(),
  odometer: z.number().nonnegative("Odometer must be non-negative").optional(),
  acquisitionCost: z
    .number()
    .nonnegative("Acquisition cost must be non-negative")
    .optional(),
  region: z.string().min(1, "Region is required").optional(),
  status: z
    .enum(Object.values(VehicleStatus) as [string, ...string[]])
    .optional(),
});

export type CreateVehicleInput = z.infer<typeof createVehicleSchema>;
export type UpdateVehicleInput = z.infer<typeof updateVehicleSchema>;

const vehicleSortFields = [
  "createdAt",
  "name",
  "odometer",
  "acquisitionCost",
] as const;

export const listVehiclesQuerySchema = paginationQuerySchema.extend({
  search: z.string().optional(),
  status: z
    .enum(Object.values(VehicleStatus) as [string, ...string[]])
    .optional(),
  type: z.string().optional(),
  region: z.string().optional(),
  sortBy: z.enum(vehicleSortFields).default("createdAt"),
  sortOrder: sortOrderSchema,
});

export type ListVehiclesQuery = z.infer<typeof listVehiclesQuerySchema>;
