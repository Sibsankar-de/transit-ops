import { StatusCodes } from "http-status-codes";
import { prisma } from "../lib/prisma";
import { ApiError } from "../utils/ApiError";
import { CreateDriverInput, UpdateDriverInput } from "../schemas/driver.schema";
import { toSafeDriver } from "../dto/driver.dto";
import { DriverModel } from "../types/driver.types";

export async function createDriver(
  data: CreateDriverInput,
): Promise<DriverModel> {
  const userExists = await prisma.user.findUnique({
    where: { id: data.userId },
  });

  if (!userExists) {
    throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
  }

  const existing = await prisma.driver.findUnique({
    where: { userId: data.userId, licenseNumber: data.licenseNumber },
  });

  if (existing) {
    throw new ApiError(
      StatusCodes.CONFLICT,
      "A driver with this license number already exists",
    );
  }

  const driver = await prisma.driver.create({
    data: {
      userId: data.userId,
      licenseNumber: data.licenseNumber,
      licenseCategory: data.licenseCategory,
      licenseExpiryDate: data.licenseExpiryDate,
    },
  });

  return toSafeDriver(driver as unknown as DriverModel);
}

export async function getDriverById(driverId: string): Promise<DriverModel> {
  const driver = await prisma.driver.findUnique({ where: { id: driverId } });

  if (!driver) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Driver not found");
  }

  return toSafeDriver(driver as unknown as DriverModel);
}

export async function getAllDrivers(): Promise<DriverModel[]> {
  const drivers = await prisma.driver.findMany();
  return drivers.map((d) => toSafeDriver(d as unknown as DriverModel));
}

export async function updateDriver(
  driverId: string,
  data: UpdateDriverInput,
): Promise<DriverModel> {
  const existing = await prisma.driver.findUnique({ where: { id: driverId } });

  if (!existing) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Driver not found");
  }

  const updated = await prisma.driver.update({
    where: { id: driverId },
    data,
  });

  return toSafeDriver(updated as unknown as DriverModel);
}

export async function deleteDriver(driverId: string): Promise<void> {
  const existing = await prisma.driver.findUnique({ where: { id: driverId } });

  if (!existing) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Driver not found");
  }

  await prisma.driver.delete({ where: { id: driverId } });
}
