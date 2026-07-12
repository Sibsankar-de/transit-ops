import { prisma } from "../lib/prisma";
import {
  NotFoundError,
  InvalidStateTransitionError,
  BusinessRuleViolationError,
} from "../utils/errors";
import {
  CreateMaintenanceLogInput,
  CloseMaintenanceLogInput,
  UpdateMaintenanceLogInput,
  ListMaintenanceLogsInput,
  VehicleMaintenanceCostInput,
} from "../schemas/maintenance.schema";
import {
  toSafeMaintenanceLog,
  toSafeMaintenanceLogWithVehicle,
} from "../dto/maintenance.dto";
import {
  MaintenanceLogModel,
  MaintenanceLogWithVehicle,
  PaginatedMaintenanceLogs,
  MaintenanceCostSummary,
} from "../types/maintenance.types";
import { VehicleStatus } from "../enums/vehicleStatus.enum";
import { MaintenanceStatus } from "../enums/maintenanceStatus.enum";
import { Prisma } from "@prisma/client";

export async function createMaintenanceLog(
  data: CreateMaintenanceLogInput,
): Promise<MaintenanceLogModel> {
  return prisma.$transaction(async (tx) => {
    const vehicle = await tx.vehicle.findUnique({
      where: { id: data.vehicleId },
    });

    if (!vehicle) {
      throw new NotFoundError(`Vehicle with id "${data.vehicleId}" not found`);
    }

    if (vehicle.status === VehicleStatus.ON_TRIP) {
      throw new BusinessRuleViolationError(
        `Vehicle "${data.vehicleId}" is currently ON_TRIP. ` +
          "Complete or cancel the active trip before scheduling maintenance.",
      );
    }

    if (vehicle.status === VehicleStatus.RETIRED) {
      throw new BusinessRuleViolationError(
        `Vehicle "${data.vehicleId}" is RETIRED and cannot enter maintenance.`,
      );
    }

    const log = await tx.maintenanceLog.create({
      data: {
        vehicleId: data.vehicleId,
        description: data.description,
        cost: data.cost,
        startDate: data.startDate,
      },
    });

    await tx.vehicle.update({
      where: { id: data.vehicleId },
      data: { status: VehicleStatus.IN_SHOP },
    });

    return toSafeMaintenanceLog(log);
  });
}

export async function closeMaintenanceLog(
  maintenanceLogId: string,
  data: CloseMaintenanceLogInput,
): Promise<MaintenanceLogModel> {
  return prisma.$transaction(async (tx) => {
    const log = await tx.maintenanceLog.findUnique({
      where: { id: maintenanceLogId },
    });

    if (!log) {
      throw new NotFoundError(
        `Maintenance log "${maintenanceLogId}" not found`,
      );
    }

    if (log.status !== MaintenanceStatus.OPEN) {
      throw new InvalidStateTransitionError(
        `Cannot close maintenance log "${maintenanceLogId}": ` +
          `current status is "${log.status}". Only OPEN records can be closed.`,
      );
    }

    const closed = await tx.maintenanceLog.update({
      where: { id: maintenanceLogId },
      data: { status: MaintenanceStatus.CLOSED, endDate: data.endDate },
    });

    const vehicle = await tx.vehicle.findUnique({
      where: { id: log.vehicleId },
    });

    if (!vehicle) {
      throw new NotFoundError(
        `Associated vehicle "${log.vehicleId}" not found`,
      );
    }

    if (vehicle.status !== VehicleStatus.RETIRED) {
      const remainingOpen = await tx.maintenanceLog.count({
        where: {
          vehicleId: log.vehicleId,
          status: MaintenanceStatus.OPEN,
          id: { not: maintenanceLogId },
        },
      });

      if (remainingOpen === 0) {
        await tx.vehicle.update({
          where: { id: log.vehicleId },
          data: { status: VehicleStatus.AVAILABLE },
        });
      }
    }

    return toSafeMaintenanceLog(closed);
  });
}

export async function updateMaintenanceLog(
  maintenanceLogId: string,
  data: UpdateMaintenanceLogInput,
): Promise<MaintenanceLogModel> {
  const log = await prisma.maintenanceLog.findUnique({
    where: { id: maintenanceLogId },
  });

  if (!log) {
    throw new NotFoundError(`Maintenance log "${maintenanceLogId}" not found`);
  }

  if (log.status !== MaintenanceStatus.OPEN) {
    throw new InvalidStateTransitionError(
      `Cannot update maintenance log "${maintenanceLogId}": ` +
        `current status is "${log.status}". Only OPEN records can be edited.`,
    );
  }

  const updated = await prisma.maintenanceLog.update({
    where: { id: maintenanceLogId },
    data,
  });

  return toSafeMaintenanceLog(updated);
}

export async function getMaintenanceLog(
  maintenanceLogId: string,
): Promise<MaintenanceLogWithVehicle> {
  const log = await prisma.maintenanceLog.findUnique({
    where: { id: maintenanceLogId },
    include: { vehicle: true },
  });

  if (!log) {
    throw new NotFoundError(`Maintenance log "${maintenanceLogId}" not found`);
  }

  return toSafeMaintenanceLogWithVehicle(log);
}

export async function listMaintenanceLogs(
  filters: ListMaintenanceLogsInput,
): Promise<PaginatedMaintenanceLogs> {
  const { vehicleId, status, dateFrom, dateTo, page, limit } = filters;

  const where: Prisma.MaintenanceLogWhereInput = {};

  if (vehicleId) where.vehicleId = vehicleId;
  if (status) where.status = status;
  if (dateFrom || dateTo) {
    where.startDate = {
      ...(dateFrom ? { gte: dateFrom } : {}),
      ...(dateTo ? { lte: dateTo } : {}),
    };
  }

  const skip = (page - 1) * limit;

  const [logs, total] = await Promise.all([
    prisma.maintenanceLog.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.maintenanceLog.count({ where }),
  ]);

  return {
    docs: logs.map(toSafeMaintenanceLog),
    limit,
    page,
    totalDocs: total,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getVehicleMaintenanceCost(
  vehicleId: string,
  filters: VehicleMaintenanceCostInput,
): Promise<MaintenanceCostSummary> {
  const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });

  if (!vehicle) {
    throw new NotFoundError(`Vehicle with id "${vehicleId}" not found`);
  }

  const where: Prisma.MaintenanceLogWhereInput = { vehicleId };

  if (filters.status) where.status = filters.status;
  if (filters.dateFrom || filters.dateTo) {
    where.startDate = {
      ...(filters.dateFrom ? { gte: filters.dateFrom } : {}),
      ...(filters.dateTo ? { lte: filters.dateTo } : {}),
    };
  }

  const result = await prisma.maintenanceLog.aggregate({
    where,
    _sum: { cost: true },
    _count: { id: true },
  });

  return {
    vehicleId,
    totalCost: Number(result._sum.cost ?? 0),
    recordCount: result._count.id,
  };
}
