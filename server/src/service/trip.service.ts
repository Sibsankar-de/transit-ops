import { StatusCodes } from "http-status-codes";
import { prisma } from "../lib/prisma";
import { ApiError } from "../utils/ApiError";
import { toSafeTrip } from "../dto/trip.dto";
import { TripModel } from "../types/trip.types";
import { PaginatedResponse } from "../types/pagination.types";
import {
  CreateTripInput,
  CompleteTripInput,
  ListTripsQuery,
} from "../schemas/trip.schema";
import { TripStatus, VehicleStatus, DriverStatus } from "@prisma/client";

export async function createTrip(
  userId: string,
  data: CreateTripInput,
): Promise<TripModel> {
  const vehicle = await prisma.vehicle.findUnique({
    where: { id: data.vehicleId },
  });
  if (!vehicle) throw new ApiError(StatusCodes.NOT_FOUND, "Vehicle not found");

  if (vehicle.status !== VehicleStatus.AVAILABLE) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      `Vehicle is not available (Current status: ${vehicle.status})`,
    );
  }

  if (Number(data.cargoWeight) > Number(vehicle.maxLoadCapacity)) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      `Cargo weight exceeds vehicle max load capacity of ${vehicle.maxLoadCapacity}`,
    );
  }

  const driver = await prisma.driver.findUnique({
    where: { id: data.driverId },
  });
  if (!driver) throw new ApiError(StatusCodes.NOT_FOUND, "Driver not found");

  if (driver.status !== DriverStatus.AVAILABLE) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      `Driver is not available (Current status: ${driver.status})`,
    );
  }

  if (new Date(driver.licenseExpiryDate) <= new Date()) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Driver's license is expired");
  }

  const trip = await prisma.trip.create({
    data: {
      ...data,
      createdById: userId,
      status: TripStatus.DRAFT,
    },
  });

  return toSafeTrip(trip);
}

export async function dispatchTrip(tripId: string): Promise<TripModel> {
  const trip = await prisma.trip.findUnique({ where: { id: tripId } });
  if (!trip) throw new ApiError(StatusCodes.NOT_FOUND, "Trip not found");

  if (trip.status !== TripStatus.DRAFT) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      `Only trips in DRAFT status can be dispatched (Current status: ${trip.status})`,
    );
  }

  const vehicle = await prisma.vehicle.findUnique({
    where: { id: trip.vehicleId },
  });
  if (!vehicle || vehicle.status !== VehicleStatus.AVAILABLE) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Vehicle is no longer available for dispatch",
    );
  }

  const driver = await prisma.driver.findUnique({
    where: { id: trip.driverId },
  });
  if (!driver || driver.status !== DriverStatus.AVAILABLE) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Driver is no longer available for dispatch",
    );
  }

  if (new Date(driver.licenseExpiryDate) <= new Date()) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Driver's license has expired");
  }

  const updatedTrip = await prisma.$transaction(async (tx) => {
    await tx.vehicle.update({
      where: { id: trip.vehicleId },
      data: { status: VehicleStatus.ON_TRIP },
    });

    await tx.driver.update({
      where: { id: trip.driverId },
      data: { status: DriverStatus.ON_TRIP },
    });

    return tx.trip.update({
      where: { id: tripId },
      data: {
        status: TripStatus.DISPATCHED,
        dispatchedAt: new Date(),
      },
    });
  });

  return toSafeTrip(updatedTrip);
}

export async function completeTrip(
  tripId: string,
  data: CompleteTripInput,
): Promise<TripModel> {
  const trip = await prisma.trip.findUnique({ where: { id: tripId } });
  if (!trip) throw new ApiError(StatusCodes.NOT_FOUND, "Trip not found");

  if (trip.status !== TripStatus.DISPATCHED) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      `Only trips in DISPATCHED status can be completed (Current status: ${trip.status})`,
    );
  }

  const vehicle = await prisma.vehicle.findUnique({
    where: { id: trip.vehicleId },
  });
  if (!vehicle)
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      "Vehicle associated with trip not found",
    );

  if (Number(data.finalOdometer) < Number(vehicle.odometer)) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      `Final odometer (${data.finalOdometer}) cannot be less than vehicle's start odometer (${vehicle.odometer})`,
    );
  }

  const actualDistance = Number(data.finalOdometer) - Number(vehicle.odometer);

  const updatedTrip = await prisma.$transaction(async (tx) => {
    await tx.vehicle.update({
      where: { id: trip.vehicleId },
      data: {
        odometer: data.finalOdometer,
        status: VehicleStatus.AVAILABLE,
      },
    });

    await tx.driver.update({
      where: { id: trip.driverId },
      data: { status: DriverStatus.AVAILABLE },
    });

    return tx.trip.update({
      where: { id: tripId },
      data: {
        status: TripStatus.COMPLETED,
        completedAt: new Date(),
        finalOdometer: data.finalOdometer,
        fuelConsumed: data.fuelConsumed,
        actualDistance,
      },
    });
  });

  return toSafeTrip(updatedTrip);
}

export async function cancelTrip(tripId: string): Promise<TripModel> {
  const trip = await prisma.trip.findUnique({ where: { id: tripId } });
  if (!trip) throw new ApiError(StatusCodes.NOT_FOUND, "Trip not found");

  if (
    trip.status === TripStatus.COMPLETED ||
    trip.status === TripStatus.CANCELLED
  ) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      `Trip cannot be cancelled from status: ${trip.status}`,
    );
  }

  const updatedTrip = await prisma.$transaction(async (tx) => {
    if (trip.status === TripStatus.DISPATCHED) {
      await tx.vehicle.update({
        where: { id: trip.vehicleId },
        data: { status: VehicleStatus.AVAILABLE },
      });

      await tx.driver.update({
        where: { id: trip.driverId },
        data: { status: DriverStatus.AVAILABLE },
      });
    }

    return tx.trip.update({
      where: { id: tripId },
      data: {
        status: TripStatus.CANCELLED,
        cancelledAt: new Date(),
      },
    });
  });

  return toSafeTrip(updatedTrip);
}

export async function getTrip(tripId: string): Promise<TripModel> {
  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    include: { vehicle: true, driver: true },
  });

  if (!trip) throw new ApiError(StatusCodes.NOT_FOUND, "Trip not found");

  return toSafeTrip(trip);
}

export async function listTrips(
  query: ListTripsQuery,
): Promise<PaginatedResponse<TripModel>> {
  const where: any = {};

  if (query.status) where.status = query.status;
  if (query.vehicleId) where.vehicleId = query.vehicleId;
  if (query.driverId) where.driverId = query.driverId;

  if (query.startDate || query.endDate) {
    where.createdAt = {};
    if (query.startDate) where.createdAt.gte = new Date(query.startDate);
    if (query.endDate) where.createdAt.lte = new Date(query.endDate);
  }

  if (query.search) {
    where.OR = [
      { source: { contains: query.search, mode: "insensitive" } },
      { destination: { contains: query.search, mode: "insensitive" } },
    ];
  }

  const skip = (query.page - 1) * query.limit;
  const orderBy = { [query.sortBy]: query.sortOrder };

  const [total, trips] = await prisma.$transaction([
    prisma.trip.count({ where }),
    prisma.trip.findMany({
      where,
      skip,
      take: query.limit,
      orderBy,
      include: { vehicle: true, driver: true },
    }),
  ]);

  return {
    docs: trips.map(toSafeTrip),
    limit: query.limit,
    page: query.page,
    totalDocs: total,
    totalPages: Math.ceil(total / query.limit),
  };
}
