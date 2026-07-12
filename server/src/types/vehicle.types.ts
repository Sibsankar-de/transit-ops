import { VehicleStatus } from "../enums/vehicleStatus.enum";

export type VehicleModel = {
  id: string;
  registrationNumber: string;
  name: string;
  type: string;
  maxLoadCapacity: number;
  odometer: number;
  acquisitionCost: number;
  region: string;
  status: VehicleStatus;
  createdAt: Date;
  updatedAt: Date;
};
