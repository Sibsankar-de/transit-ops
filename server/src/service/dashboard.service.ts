import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { VehicleStatus } from "../enums/vehicleStatus.enum";
import { DriverStatus } from "../enums/driverStatus.enum";
import { TripStatus } from "../enums/tripStatus.enum";
import { DashboardKPIInput } from "../schemas/dashboard.schema";
import { DashboardKPIs } from "../types/dashboard.types";

export async function getDashboardKPIs(
  filters: DashboardKPIInput,
): Promise<DashboardKPIs> {
  const vehicleWhere: Prisma.VehicleWhereInput = {};
  if (filters.vehicleType) vehicleWhere.type = filters.vehicleType;
  if (filters.status) vehicleWhere.status = filters.status;
  if (filters.region) vehicleWhere.region = filters.region;

  const vehicleGroups = await prisma.vehicle.groupBy({
    by: ["status"],
    where: vehicleWhere,
    _count: { id: true },
  });

  const vcMap = Object.fromEntries(
    vehicleGroups.map((g) => [g.status as string, g._count.id]),
  ) as Record<string, number>;

  const available = vcMap[VehicleStatus.AVAILABLE] ?? 0;
  const onTrip = vcMap[VehicleStatus.ON_TRIP] ?? 0;
  const inShop = vcMap[VehicleStatus.IN_SHOP] ?? 0;
  const nonRetired = available + onTrip + inShop;

  const needsVehicleScope = !!(filters.vehicleType || filters.region);
  let tripVehicleFilter: Prisma.TripWhereInput = {};

  if (needsVehicleScope) {
    const vehicleIds = await prisma.vehicle.findMany({
      where: vehicleWhere,
      select: { id: true },
    });
    const ids = vehicleIds.map((v) => v.id);
    tripVehicleFilter =
      ids.length > 0 ? { vehicleId: { in: ids } } : { vehicleId: { in: [] } };
  }

  const [activeTrips, pendingTrips, driversOnDuty] = await Promise.all([
    prisma.trip.count({
      where: { ...tripVehicleFilter, status: TripStatus.DISPATCHED },
    }),
    prisma.trip.count({
      where: { ...tripVehicleFilter, status: TripStatus.DRAFT },
    }),
    prisma.driver.count({ where: { status: DriverStatus.ON_TRIP } }),
  ]);
  const fleetUtilization =
    nonRetired > 0 ? Math.round((onTrip / nonRetired) * 100 * 100) / 100 : 0;

  return {
    activeVehicles: available + onTrip,
    availableVehicles: available,
    vehiclesInMaintenance: inShop,
    activeTrips,
    pendingTrips,
    driversOnDuty,
    fleetUtilization,
  };
}
