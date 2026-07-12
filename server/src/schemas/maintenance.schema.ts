import { z } from "zod";
import { paginationQuerySchema, sortOrderSchema } from "./pagination.schema";
import { MaintenanceStatus } from "../enums/maintenanceStatus.enum";

export const createMaintenanceLogSchema = z.object({
  vehicleId: z.string().uuid("vehicleId must be a valid UUID"),
  description: z.string().min(1, "Description is required"),
  cost: z.number().nonnegative("Cost must be non-negative"),
  startDate: z.coerce.date({ message: "Invalid startDate" }),
});

export const closeMaintenanceLogSchema = z.object({
  endDate: z.coerce.date({ message: "Invalid endDate" }),
});

export const updateMaintenanceLogSchema = z
  .object({
    description: z.string().min(1, "Description cannot be empty").optional(),
    cost: z.number().nonnegative("Cost must be non-negative").optional(),
    startDate: z.coerce.date({ message: "Invalid startDate" }).optional(),
    endDate: z.coerce.date({ message: "Invalid endDate" }).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided to update",
  });

const maintenanceSortFields = ["createdAt", "startDate", "cost"] as const;

export const listMaintenanceLogsSchema = z
  .object({
    vehicleId: z.string().uuid("vehicleId must be a valid UUID").optional(),
    status: z.nativeEnum(MaintenanceStatus).optional(),
    dateFrom: z.coerce.date({ message: "Invalid dateFrom" }).optional(),
    dateTo: z.coerce.date({ message: "Invalid dateTo" }).optional(),
    search: z.string().optional(),
    costMin: z.coerce.number().nonnegative().optional(),
    costMax: z.coerce.number().nonnegative().optional(),
    sortBy: z.enum(maintenanceSortFields).default("createdAt"),
    sortOrder: sortOrderSchema,
  })
  .merge(paginationQuerySchema);

export const vehicleMaintenanceCostSchema = z.object({
  dateFrom: z.coerce.date({ message: "Invalid dateFrom" }).optional(),
  dateTo: z.coerce.date({ message: "Invalid dateTo" }).optional(),
  status: z.nativeEnum(MaintenanceStatus).optional(),
});

export type CreateMaintenanceLogInput = z.infer<
  typeof createMaintenanceLogSchema
>;
export type CloseMaintenanceLogInput = z.infer<
  typeof closeMaintenanceLogSchema
>;
export type UpdateMaintenanceLogInput = z.infer<
  typeof updateMaintenanceLogSchema
>;
export type ListMaintenanceLogsInput = z.infer<
  typeof listMaintenanceLogsSchema
>;
export type VehicleMaintenanceCostInput = z.infer<
  typeof vehicleMaintenanceCostSchema
>;
