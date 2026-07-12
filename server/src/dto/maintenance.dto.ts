import {
  MaintenanceLogModel,
  MaintenanceLogWithVehicle,
} from "../types/maintenance.types";
import { VehicleModel } from "../types/vehicle.types";
import { toSafeVehicle } from "./vehicle.dto";

export function toSafeMaintenanceLog(raw: any): MaintenanceLogModel {
  return {
    id: raw.id,
    vehicleId: raw.vehicleId,
    description: raw.description,
    cost: Number(raw.cost),
    status: raw.status,
    startDate: raw.startDate,
    endDate: raw.endDate ?? null,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

export function toSafeMaintenanceLogWithVehicle(
  raw: any,
): MaintenanceLogWithVehicle {
  return {
    ...toSafeMaintenanceLog(raw),
    vehicle: toSafeVehicle(raw.vehicle as VehicleModel),
  };
}
