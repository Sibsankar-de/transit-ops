import { StatusCodes } from "http-status-codes";
import { prisma } from "../lib/prisma";
import { ApiError } from "../utils/ApiError";
import {
  CreateDriverInput,
  UpdateDriverInput,
  ListDriversQuery,
} from "../schemas/driver.schema";
import { toSafeDriver } from "../dto/driver.dto";
import { DriverModel } from "../types/driver.types";
import { PaginatedResponse } from "../types/pagination.types";
import { Prisma } from "@prisma/client";

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

export async function getAllDrivers(
  query: ListDriversQuery,
): Promise<PaginatedResponse<DriverModel>> {
  const where: Prisma.DriverWhereInput = {};

  if (query.status) where.status = query.status as any;
  if (query.licenseCategory) {
    where.licenseCategory = {
      equals: query.licenseCategory,
      mode: "insensitive",
    };
  }
  if (query.search) {
    where.OR = [
      { licenseNumber: { contains: query.search, mode: "insensitive" } },
      { user: { name: { contains: query.search, mode: "insensitive" } } },
      { user: { email: { contains: query.search, mode: "insensitive" } } },
    ];
  }

  const skip = (query.page - 1) * query.limit;
  const orderBy = { [query.sortBy]: query.sortOrder };

  const [total, drivers] = await prisma.$transaction([
    prisma.driver.count({ where }),
    prisma.driver.findMany({
      where,
      skip,
      take: query.limit,
      orderBy,
      include: { user: true },
    }),
  ]);

  return {
    docs: drivers.map((d) => toSafeDriver(d as unknown as DriverModel)),
    limit: query.limit,
    page: query.page,
    totalDocs: total,
    totalPages: Math.ceil(total / query.limit),
  };
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
    data: data as any,
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
