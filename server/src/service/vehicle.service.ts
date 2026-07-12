import { StatusCodes } from "http-status-codes";
import { prisma } from "../lib/prisma";
import { ApiError } from "../utils/ApiError";
import {
  CreateVehicleInput,
  UpdateVehicleInput,
} from "../schemas/vehicle.schema";
import { toSafeVehicle } from "../dto/vehicle.dto";
import { VehicleModel } from "../types/vehicle.types";
import { generateSecureToken } from "../utils/tokenGenerator";

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
    data,
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
