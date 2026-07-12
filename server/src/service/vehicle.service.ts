import { StatusCodes } from "http-status-codes";
import { prisma } from "../lib/prisma";
import { ApiError } from "../utils/ApiError";
import {
  CreateVehicleInput,
  UpdateVehicleInput,
  ListVehiclesQuery,
} from "../schemas/vehicle.schema";
import { toSafeVehicle } from "../dto/vehicle.dto";
import { VehicleModel } from "../types/vehicle.types";
import { generateSecureToken } from "../utils/tokenGenerator";
import { PaginatedResponse } from "../types/pagination.types";
import { Prisma } from "@prisma/client";

export async function createVehicle(
  data: CreateVehicleInput,
): Promise<VehicleModel> {
  const registrationNumber = generateSecureToken(64);
  const vehicle = await prisma.vehicle.create({
    data: {
      name: data.name,
      type: data.type,
      maxLoadCapacity: data.maxLoadCapacity,
      odometer: data.odometer ?? 0,
      acquisitionCost: data.acquisitionCost,
      region: data.region,
      registrationNumber: registrationNumber,
    },
  });

  return toSafeVehicle(vehicle as unknown as VehicleModel);
}

export async function getAllVehicles(
  query: ListVehiclesQuery,
): Promise<PaginatedResponse<VehicleModel>> {
  const where: Prisma.VehicleWhereInput = {};

  if (query.status) where.status = query.status as any;
  if (query.type) where.type = { equals: query.type, mode: "insensitive" };
  if (query.region)
    where.region = { equals: query.region, mode: "insensitive" };
  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: "insensitive" } },
      {
        registrationNumber: { contains: query.search, mode: "insensitive" },
      },
      { type: { contains: query.search, mode: "insensitive" } },
      { region: { contains: query.search, mode: "insensitive" } },
    ];
  }

  const skip = (query.page - 1) * query.limit;
  const orderBy = { [query.sortBy]: query.sortOrder };

  const [total, vehicles] = await prisma.$transaction([
    prisma.vehicle.count({ where }),
    prisma.vehicle.findMany({ where, skip, take: query.limit, orderBy }),
  ]);

  return {
    docs: vehicles.map((v) => toSafeVehicle(v as unknown as VehicleModel)),
    limit: query.limit,
    page: query.page,
    totalDocs: total,
    totalPages: Math.ceil(total / query.limit),
  };
}

export async function updateVehicle(
  vehicleId: string,
  data: UpdateVehicleInput,
): Promise<VehicleModel> {
  const existing = await prisma.vehicle.findUnique({
    where: { id: vehicleId },
  });

  if (!existing) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Vehicle not found");
  }

  const updated = await prisma.vehicle.update({
    where: { id: vehicleId },
    data: data as any,
  });

  return toSafeVehicle(updated as unknown as VehicleModel);
}

export async function deleteVehicle(vehicleId: string): Promise<void> {
  const existing = await prisma.vehicle.findUnique({
    where: { id: vehicleId },
  });

  if (!existing) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Vehicle not found");
  }

  await prisma.vehicle.delete({ where: { id: vehicleId } });
}
