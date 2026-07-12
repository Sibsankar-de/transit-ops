import { z } from "zod";

const dateRangeSchema = z.object({
  startDate: z.coerce.date({ message: "Invalid startDate" }).optional(),
  endDate: z.coerce.date({ message: "Invalid endDate" }).optional(),
});

const vehicleIdSchema = z.object({
  vehicleId: z.string().uuid("vehicleId must be a valid UUID").optional(),
});

export const fuelEfficiencySchema = dateRangeSchema.merge(vehicleIdSchema);

export const fleetUtilizationSchema = dateRangeSchema.extend({
  groupBy: z.enum(["day", "week", "month"]).optional(),
});

export const operationalCostSchema = dateRangeSchema.merge(vehicleIdSchema);

export const vehicleROISchema = dateRangeSchema.merge(vehicleIdSchema);

export const exportCSVSchema = dateRangeSchema.merge(vehicleIdSchema).extend({
  reportType: z.enum([
    "fuelEfficiency",
    "fleetUtilization",
    "operationalCost",
    "roi",
  ]),
  groupBy: z.enum(["day", "week", "month"]).optional(),
});

export type FuelEfficiencyInput = z.infer<typeof fuelEfficiencySchema>;
export type FleetUtilizationInput = z.infer<typeof fleetUtilizationSchema>;
export type OperationalCostInput = z.infer<typeof operationalCostSchema>;
export type VehicleROIInput = z.infer<typeof vehicleROISchema>;
export type ExportCSVInput = z.infer<typeof exportCSVSchema>;
