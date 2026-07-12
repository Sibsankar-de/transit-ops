import { TripModel } from "../types/trip.types";
import { toSafeVehicle } from "./vehicle.dto";
import { toSafeDriver } from "./driver.dto";

export function toSafeTrip(trip: any): TripModel {
  return {
    id: trip.id,
    source: trip.source,
    destination: trip.destination,
    vehicleId: trip.vehicleId,
    driverId: trip.driverId,
    cargoWeight: Number(trip.cargoWeight),
    plannedDistance: Number(trip.plannedDistance),
    actualDistance: trip.actualDistance ? Number(trip.actualDistance) : null,
    finalOdometer: trip.finalOdometer ? Number(trip.finalOdometer) : null,
    fuelConsumed: trip.fuelConsumed ? Number(trip.fuelConsumed) : null,
    revenue: trip.revenue ? Number(trip.revenue) : null,
    status: trip.status,
    dispatchedAt: trip.dispatchedAt,
    completedAt: trip.completedAt,
    cancelledAt: trip.cancelledAt,
    createdById: trip.createdById,
    createdAt: trip.createdAt,
    updatedAt: trip.updatedAt,
    vehicle: trip.vehicle ? toSafeVehicle(trip.vehicle as any) : undefined,
    driver: trip.driver ? toSafeDriver(trip.driver as any) : undefined,
  };
}
