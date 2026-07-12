import { z } from "zod";
import { VehicleStatus } from "../enums/vehicleStatus.enum";

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
  status: z.enum(VehicleStatus).optional(),
});

export type CreateVehicleInput = z.infer<typeof createVehicleSchema>;
export type UpdateVehicleInput = z.infer<typeof updateVehicleSchema>;
