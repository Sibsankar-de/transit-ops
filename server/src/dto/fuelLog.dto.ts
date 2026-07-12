import { FuelLogModel } from "../types/fuelLog.types";
import { toSafeVehicle } from "./vehicle.dto";
import { toSafeTrip } from "./trip.dto";

export function toSafeFuelLog(log: any): FuelLogModel {
  return {
    id: log.id,
    vehicleId: log.vehicleId,
    tripId: log.tripId,
    liters: Number(log.liters),
    cost: Number(log.cost),
    date: log.date,
    createdAt: log.createdAt,
    vehicle: log.vehicle ? toSafeVehicle(log.vehicle) : undefined,
    trip: log.trip ? toSafeTrip(log.trip) : undefined,
  };
}
