import { VehicleModel } from "./vehicle.types";
import { TripModel } from "./trip.types";

export type FuelLogModel = {
  id: string;
  vehicleId: string;
  tripId: string | null;
  liters: number;
  cost: number;
  date: Date;
  createdAt: Date;
  vehicle?: VehicleModel;
  trip?: TripModel;
};
