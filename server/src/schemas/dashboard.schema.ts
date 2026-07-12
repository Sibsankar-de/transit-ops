import { z } from "zod";
import { VehicleStatus } from "../enums/vehicleStatus.enum";

export const dashboardKPISchema = z.object({
  vehicleType: z.string().min(1).optional(),
  status: z.nativeEnum(VehicleStatus).optional(),
  region: z.string().min(1).optional(),
});

export type DashboardKPIInput = z.infer<typeof dashboardKPISchema>;
