import { z } from "zod";
import { paginationQuerySchema } from "./pagination.schema";
import { TripStatus } from "@prisma/client";

const tripStatusValues = Object.values(TripStatus) as [string, ...string[]];

export const createTripSchema = z.object({
  source: z.string().min(1, "Source is required"),
  destination: z.string().min(1, "Destination is required"),
  vehicleId: z.uuid("Invalid vehicle ID"),
  driverId: z.uuid("Invalid driver ID"),
  cargoWeight: z.number().positive("Cargo weight must be positive"),
  plannedDistance: z.number().positive("Planned distance must be positive"),
});

export const completeTripSchema = z.object({
  finalOdometer: z.number().positive("Final odometer must be positive"),
  fuelConsumed: z.number().positive("Fuel consumed must be positive"),
});

export const listTripsQuerySchema = z.object({
  status: z.enum(tripStatusValues).optional(),
  vehicleId: z.uuid("Invalid vehicle ID").optional(),
  driverId: z.uuid("Invalid driver ID").optional(),
  startDate: z.string().datetime({ precision: 3 }).optional(),
  endDate: z.string().datetime({ precision: 3 }).optional(),
}).merge(paginationQuerySchema);

export type CreateTripInput = z.infer<typeof createTripSchema>;
export type CompleteTripInput = z.infer<typeof completeTripSchema>;
export type ListTripsQuery = z.infer<typeof listTripsQuerySchema>;
