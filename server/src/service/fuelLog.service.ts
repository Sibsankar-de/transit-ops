import { StatusCodes } from "http-status-codes";
import { prisma } from "../lib/prisma";
import { ApiError } from "../utils/ApiError";
import { toSafeFuelLog } from "../dto/fuelLog.dto";
import { FuelLogModel } from "../types/fuelLog.types";
import { PaginatedResponse } from "../types/pagination.types";
import {
  CreateFuelLogInput,
  UpdateFuelLogInput,
  ListFuelLogsQuery,
} from "../schemas/fuelLog.schema";

export async function createFuelLog(
  data: CreateFuelLogInput,
): Promise<FuelLogModel> {
  if (data.liters <= 0 || data.cost <= 0) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Liters and cost must be greater than 0",
    );
  }

  if (new Date(data.date) > new Date()) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Date cannot be in the future");
  }

  const vehicle = await prisma.vehicle.findUnique({
    where: { id: data.vehicleId },
  });
  if (!vehicle) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Vehicle not found");
  }

  if (data.tripId) {
    const trip = await prisma.trip.findUnique({ where: { id: data.tripId } });
    if (!trip) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Trip not found");
    }
    if (trip.vehicleId !== data.vehicleId) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Trip belongs to a different vehicle",
      );
    }
  }

  const fuelLog = await prisma.fuelLog.create({
    data: {
      vehicleId: data.vehicleId,
      tripId: data.tripId || null,
      liters: data.liters,
      cost: data.cost,
      date: data.date,
    },
  });

  return toSafeFuelLog(fuelLog);
}

export async function updateFuelLog(
  fuelLogId: string,
  data: UpdateFuelLogInput,
): Promise<FuelLogModel> {
  if (data.liters !== undefined && data.liters <= 0) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Liters must be greater than 0",
    );
  }
  if (data.cost !== undefined && data.cost <= 0) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Cost must be greater than 0");
  }
  if (data.date !== undefined && new Date(data.date) > new Date()) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Date cannot be in the future");
  }

  const existing = await prisma.fuelLog.findUnique({
    where: { id: fuelLogId },
  });
  if (!existing) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Fuel log not found");
  }

  const updated = await prisma.fuelLog.update({
    where: { id: fuelLogId },
    data: {
      liters: data.liters,
      cost: data.cost,
      date: data.date,
    },
  });

  return toSafeFuelLog(updated);
}

export async function deleteFuelLog(fuelLogId: string): Promise<void> {
  const existing = await prisma.fuelLog.findUnique({
    where: { id: fuelLogId },
  });
  if (!existing) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Fuel log not found");
  }

  await prisma.fuelLog.delete({ where: { id: fuelLogId } });
}

export async function getFuelLog(fuelLogId: string): Promise<FuelLogModel> {
  const fuelLog = await prisma.fuelLog.findUnique({
    where: { id: fuelLogId },
    include: { vehicle: true, trip: true },
  });
  if (!fuelLog) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Fuel log not found");
  }
  return toSafeFuelLog(fuelLog);
}

export async function listFuelLogs(
  query: ListFuelLogsQuery,
): Promise<PaginatedResponse<FuelLogModel>> {
  const where: any = {};
  if (query.vehicleId) where.vehicleId = query.vehicleId;
  if (query.tripId) where.tripId = query.tripId;
  if (query.startDate || query.endDate) {
    where.date = {};
    if (query.startDate) where.date.gte = query.startDate;
    if (query.endDate) where.date.lte = query.endDate;
  }

  const skip = (query.page - 1) * query.limit;

  const [total, fuelLogs] = await prisma.$transaction([
    prisma.fuelLog.count({ where }),
    prisma.fuelLog.findMany({
      where,
      skip,
      take: query.limit,
      orderBy: { date: "desc" },
      include: { vehicle: true, trip: true },
    }),
  ]);

  return {
    docs: fuelLogs.map(toSafeFuelLog),
    limit: query.limit,
    page: query.page,
    totalDocs: total,
    totalPages: Math.ceil(total / query.limit),
  };
}

export async function getVehicleFuelStats(
  vehicleId: string,
  startDate?: Date,
  endDate?: Date,
) {
  const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
  if (!vehicle) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Vehicle not found");
  }

  const where: any = { vehicleId };
  if (startDate || endDate) {
    where.date = {};
    if (startDate) where.date.gte = startDate;
    if (endDate) where.date.lte = endDate;
  }

  const fuelLogs = await prisma.fuelLog.findMany({
    where,
    include: { trip: true },
  });

  let totalLiters = 0;
  let totalFuelCost = 0;
  const associatedTrips = new Map<string, any>();

  for (const log of fuelLogs) {
    totalLiters += Number(log.liters);
    totalFuelCost += Number(log.cost);
    if (log.trip) {
      associatedTrips.set(log.trip.id, log.trip);
    }
  }

  const uniqueTrips = Array.from(associatedTrips.values());
  let fuelEfficiency: number | null = null;

  if (uniqueTrips.length > 0 && totalLiters > 0) {
    let totalDistance = 0;
    for (const trip of uniqueTrips) {
      totalDistance += Number(trip.actualDistance ?? trip.plannedDistance ?? 0);
    }
    fuelEfficiency = totalDistance / totalLiters;
  }

  return {
    totalLiters,
    totalFuelCost,
    fuelEfficiency,
  };
}
