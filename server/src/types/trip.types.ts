import { TripStatus } from "@prisma/client";
import { VehicleModel } from "./vehicle.types";
import { DriverModel } from "./driver.types";

export type TripModel = {
  id: string;
  source: string;
  destination: string;
  vehicleId: string;
  driverId: string;
  cargoWeight: number;
  plannedDistance: number;
  actualDistance: number | null;
  finalOdometer: number | null;
  fuelConsumed: number | null;
  revenue: number | null;
  status: TripStatus;
  dispatchedAt: Date | null;
  completedAt: Date | null;
  cancelledAt: Date | null;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
  vehicle?: VehicleModel;
  driver?: DriverModel;
};
