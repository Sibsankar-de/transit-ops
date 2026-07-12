import { MaintenanceStatus } from "../enums/maintenanceStatus.enum";
import { VehicleModel } from "./vehicle.types";

export type MaintenanceLogModel = {
  id: string;
  vehicleId: string;
  description: string;
  cost: number;
  status: MaintenanceStatus;
  startDate: Date;
  endDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type MaintenanceLogWithVehicle = MaintenanceLogModel & {
  vehicle: VehicleModel;
};

export type PaginatedMaintenanceLogs = {
  data: MaintenanceLogModel[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type MaintenanceCostSummary = {
  vehicleId: string;
  totalCost: number;
  recordCount: number;
};
