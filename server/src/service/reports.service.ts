import { Prisma } from "@prisma/client";
import { Response } from "express";
import { prisma } from "../lib/prisma";
import { NotFoundError, InvalidInputError } from "../utils/errors";
import { VehicleStatus } from "../enums/vehicleStatus.enum";
import { TripStatus } from "../enums/tripStatus.enum";
import {
  FuelEfficiencyInput,
  FleetUtilizationInput,
  OperationalCostInput,
  VehicleROIInput,
  ExportCSVInput,
} from "../schemas/reports.schema";
import {
  FuelEfficiencyRow,
  FleetUtilizationReport,
  FleetUtilizationTimeSeriesEntry,
  OperationalCostRow,
  VehicleROIRow,
} from "../types/reports.types";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Builds a Prisma date-range filter for a given field name. */
function dateRangeFilter(
  field: string,
  startDate?: Date,
  endDate?: Date,
): Record<string, object> {
  if (!startDate && !endDate) return {};
  return {
    [field]: {
      ...(startDate ? { gte: startDate } : {}),
      ...(endDate ? { lte: endDate } : {}),
    },
  };
}

/**
 * Escapes a single CSV cell value per RFC 4180:
 *   - null/undefined → empty string
 *   - Values containing comma, double-quote, or newline are wrapped in double-quotes
 *   - Internal double-quotes are doubled ("")
 */
function toCsvCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. getFuelEfficiencyReport
//
// Per-vehicle aggregate mode (no vehicleId):
//   Query 1: trip groupBy vehicleId → SUM(actualDistance) for COMPLETED trips
//   Query 2: fuelLog groupBy vehicleId → SUM(liters)
//   Query 3: vehicle findMany → names
//   All three run in parallel. efficiency = totalDistance / totalLiters.
//   null when totalLiters = 0 or no fuel data; vehicle still appears in results.
//   Sorted descending by efficiency (nulls last).
//
// Single-vehicle mode (vehicleId given):
//   Vehicle existence validated first. Same two aggregations scoped to vehicle.
// ─────────────────────────────────────────────────────────────────────────────
export async function getFuelEfficiencyReport(
  filters: FuelEfficiencyInput,
): Promise<FuelEfficiencyRow[]> {
  const { vehicleId, startDate, endDate } = filters;
  const tripDateFilter = dateRangeFilter("completedAt", startDate, endDate);
  const fuelDateFilter = dateRangeFilter("date", startDate, endDate);

  if (vehicleId) {
    // ── Single-vehicle mode ──────────────────────────────────────────────────
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
      select: { id: true, name: true },
    });
    if (!vehicle) throw new NotFoundError(`Vehicle "${vehicleId}" not found`);

    const [tripAgg, fuelAgg] = await Promise.all([
      prisma.trip.aggregate({
        where: { vehicleId, status: TripStatus.COMPLETED, ...tripDateFilter },
        _sum: { actualDistance: true },
      }),
      prisma.fuelLog.aggregate({
        where: { vehicleId, ...fuelDateFilter },
        _sum: { liters: true },
      }),
    ]);

    const totalDistance = Number(tripAgg._sum.actualDistance ?? 0);
    const totalLiters = Number(fuelAgg._sum.liters ?? 0);
    const efficiency =
      totalLiters > 0
        ? Math.round((totalDistance / totalLiters) * 10000) / 10000
        : null;

    return [{ vehicleId: vehicle.id, vehicleName: vehicle.name, efficiency }];
  }

  // ── Fleet-wide mode ──────────────────────────────────────────────────────
  const [vehicles, tripGroups, fuelGroups] = await Promise.all([
    prisma.vehicle.findMany({ select: { id: true, name: true } }),
    prisma.trip.groupBy({
      by: ["vehicleId"],
      where: { status: TripStatus.COMPLETED, ...tripDateFilter },
      _sum: { actualDistance: true },
    }),
    prisma.fuelLog.groupBy({
      by: ["vehicleId"],
      where: { ...fuelDateFilter },
      _sum: { liters: true },
    }),
  ]);

  // Build lookup maps
  const distMap = new Map(
    tripGroups.map((g) => [g.vehicleId, Number(g._sum.actualDistance ?? 0)]),
  );
  const literMap = new Map(
    fuelGroups.map((g) => [g.vehicleId, Number(g._sum.liters ?? 0)]),
  );

  const rows: FuelEfficiencyRow[] = vehicles.map((v) => {
    const totalLiters = literMap.get(v.id) ?? 0;
    const totalDistance = distMap.get(v.id) ?? 0;
    const efficiency =
      totalLiters > 0
        ? Math.round((totalDistance / totalLiters) * 10000) / 10000
        : null;
    return { vehicleId: v.id, vehicleName: v.name, efficiency };
  });

  // Sort: non-null descending, then nulls at end
  rows.sort((a, b) => {
    if (a.efficiency === null && b.efficiency === null) return 0;
    if (a.efficiency === null) return 1;
    if (b.efficiency === null) return -1;
    return b.efficiency - a.efficiency;
  });

  return rows;
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. getFleetUtilizationReport
//
// Point-in-time (no date range): single vehicle groupBy — same as dashboard KPI.
//
// Time-series (date range + groupBy): uses $queryRaw with date_trunc for
// PostgreSQL-level bucketing. This is the only function in the codebase that
// requires raw SQL — chosen to avoid loading all trip records into app memory.
// ─────────────────────────────────────────────────────────────────────────────
export async function getFleetUtilizationReport(
  filters: FleetUtilizationInput,
): Promise<FleetUtilizationReport> {
  const { startDate, endDate, groupBy } = filters;

  // ── Point-in-time mode ────────────────────────────────────────────────────
  if (!startDate && !endDate) {
    const groups = await prisma.vehicle.groupBy({
      by: ["status"],
      _count: { id: true },
    });
    const vcMap = Object.fromEntries(
      groups.map((g) => [g.status as string, g._count.id]),
    );

    const onTripVehicles = vcMap[VehicleStatus.ON_TRIP] ?? 0;
    const available = vcMap[VehicleStatus.AVAILABLE] ?? 0;
    const inShop = vcMap[VehicleStatus.IN_SHOP] ?? 0;
    const nonRetiredVehicles = onTripVehicles + available + inShop;

    const fleetUtilization =
      nonRetiredVehicles > 0
        ? Math.round((onTripVehicles / nonRetiredVehicles) * 100 * 100) / 100
        : 0;

    return {
      mode: "point-in-time",
      fleetUtilization,
      nonRetiredVehicles,
      onTripVehicles,
    };
  }

  // ── Time-series mode ──────────────────────────────────────────────────────
  const truncUnit = groupBy ?? "day";

  // Total non-retired vehicles (denominator, constant across all periods)
  const nonRetiredVehicles = await prisma.vehicle.count({
    where: { status: { not: VehicleStatus.RETIRED } },
  });

  // Raw SQL: bucket DISPATCHED/COMPLETED trips by period using date_trunc.
  // A trip is "active in period" if it was dispatched at any point during the range.
  // We count distinct vehicles per bucket — not trip count.
  type RawRow = { period: string; active_count: bigint };

  let periodFormat: string;
  if (truncUnit === "day") periodFormat = "YYYY-MM-DD";
  else if (truncUnit === "week") periodFormat = 'IYYY-"W"IW';
  else periodFormat = "YYYY-MM";

  const rawRows = await prisma.$queryRaw<RawRow[]>`
    SELECT
      TO_CHAR(DATE_TRUNC(${truncUnit}, t."dispatchedAt"), ${periodFormat}) AS "period",
      COUNT(DISTINCT t."vehicleId")::int                                    AS "active_count"
    FROM "Trip" t
    WHERE t."status" IN ('DISPATCHED', 'COMPLETED')
      AND t."dispatchedAt" IS NOT NULL
      ${startDate ? Prisma.sql`AND t."dispatchedAt" >= ${startDate}` : Prisma.empty}
      ${endDate ? Prisma.sql`AND t."dispatchedAt" <= ${endDate}` : Prisma.empty}
    GROUP BY DATE_TRUNC(${truncUnit}, t."dispatchedAt")
    ORDER BY DATE_TRUNC(${truncUnit}, t."dispatchedAt") ASC
  `;

  const timeSeries: FleetUtilizationTimeSeriesEntry[] = rawRows.map((row) => ({
    period: row.period,
    utilization:
      nonRetiredVehicles > 0
        ? Math.round(
            (Number(row.active_count) / nonRetiredVehicles) * 100 * 100,
          ) / 100
        : 0,
  }));

  return { mode: "time-series", nonRetiredVehicles, timeSeries };
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. getOperationalCostReport
//
// Strictly Fuel + Maintenance only (Expense table excluded per spec).
// Every non-Retired vehicle appears even if costs are 0.
//
// Queries (3, all parallel after initial vehicle fetch):
//   - vehicle findMany (non-Retired, optionally scoped to vehicleId)
//   - fuelLog groupBy vehicleId → SUM(cost)
//   - maintenanceLog groupBy vehicleId → SUM(cost)
// ─────────────────────────────────────────────────────────────────────────────
export async function getOperationalCostReport(
  filters: OperationalCostInput,
): Promise<OperationalCostRow[]> {
  const { vehicleId, startDate, endDate } = filters;
  const fuelDateFilter = dateRangeFilter("date", startDate, endDate);
  const maintDateFilter = dateRangeFilter("startDate", startDate, endDate);

  // All non-retired vehicles (or just the one if scoped)
  const vehicleWhere: Prisma.VehicleWhereInput = {
    status: { not: VehicleStatus.RETIRED },
    ...(vehicleId ? { id: vehicleId } : {}),
  };

  // Validate single-vehicle lookup
  if (vehicleId) {
    const exists = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
      select: { id: true },
    });
    if (!exists) throw new NotFoundError(`Vehicle "${vehicleId}" not found`);
  }

  const vehicles = await prisma.vehicle.findMany({
    where: vehicleWhere,
    select: { id: true, name: true },
  });

  if (vehicles.length === 0) return [];

  const vehicleIds = vehicles.map((v) => v.id);

  const [fuelGroups, maintGroups] = await Promise.all([
    prisma.fuelLog.groupBy({
      by: ["vehicleId"],
      where: { vehicleId: { in: vehicleIds }, ...fuelDateFilter },
      _sum: { cost: true },
    }),
    prisma.maintenanceLog.groupBy({
      by: ["vehicleId"],
      where: { vehicleId: { in: vehicleIds }, ...maintDateFilter },
      _sum: { cost: true },
    }),
  ]);

  const fuelMap = new Map(
    fuelGroups.map((g) => [g.vehicleId, Number(g._sum.cost ?? 0)]),
  );
  const maintMap = new Map(
    maintGroups.map((g) => [g.vehicleId, Number(g._sum.cost ?? 0)]),
  );

  const rows: OperationalCostRow[] = vehicles.map((v) => {
    const fuelCost = fuelMap.get(v.id) ?? 0;
    const maintenanceCost = maintMap.get(v.id) ?? 0;
    return {
      vehicleId: v.id,
      vehicleName: v.name,
      fuelCost,
      maintenanceCost,
      totalOperationalCost: fuelCost + maintenanceCost,
    };
  });

  rows.sort((a, b) => b.totalOperationalCost - a.totalOperationalCost);
  return rows;
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. getVehicleROIReport
//
// ROI = (revenue - (maintenanceCost + fuelCost)) / acquisitionCost
// revenue = SUM(trip.revenue) for COMPLETED trips in range.
// acquisitionCost = 0 or null → roi: null with roiNullReason (does not fail request).
// Non-retired vehicles with zero activity still appear with roi computed.
//
// Queries (4 parallel after initial vehicle fetch):
//   - vehicle findMany (includes acquisitionCost)
//   - trip groupBy → SUM(revenue)
//   - fuelLog groupBy → SUM(cost)
//   - maintenanceLog groupBy → SUM(cost)
// ─────────────────────────────────────────────────────────────────────────────
export async function getVehicleROIReport(
  filters: VehicleROIInput,
): Promise<VehicleROIRow[]> {
  const { vehicleId, startDate, endDate } = filters;
  const tripDateFilter = dateRangeFilter("completedAt", startDate, endDate);
  const fuelDateFilter = dateRangeFilter("date", startDate, endDate);
  const maintDateFilter = dateRangeFilter("startDate", startDate, endDate);

  const vehicleWhere: Prisma.VehicleWhereInput = {
    status: { not: VehicleStatus.RETIRED },
    ...(vehicleId ? { id: vehicleId } : {}),
  };

  if (vehicleId) {
    const exists = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
      select: { id: true },
    });
    if (!exists) throw new NotFoundError(`Vehicle "${vehicleId}" not found`);
  }

  const vehicles = await prisma.vehicle.findMany({
    where: vehicleWhere,
    select: { id: true, name: true, acquisitionCost: true },
  });

  if (vehicles.length === 0) return [];

  const vehicleIds = vehicles.map((v) => v.id);

  const [revenueGroups, fuelGroups, maintGroups] = await Promise.all([
    prisma.trip.groupBy({
      by: ["vehicleId"],
      where: {
        vehicleId: { in: vehicleIds },
        status: TripStatus.COMPLETED,
        ...tripDateFilter,
      },
      _sum: { revenue: true },
    }),
    prisma.fuelLog.groupBy({
      by: ["vehicleId"],
      where: { vehicleId: { in: vehicleIds }, ...fuelDateFilter },
      _sum: { cost: true },
    }),
    prisma.maintenanceLog.groupBy({
      by: ["vehicleId"],
      where: { vehicleId: { in: vehicleIds }, ...maintDateFilter },
      _sum: { cost: true },
    }),
  ]);

  const revenueMap = new Map(
    revenueGroups.map((g) => [g.vehicleId, Number(g._sum.revenue ?? 0)]),
  );
  const fuelMap = new Map(
    fuelGroups.map((g) => [g.vehicleId, Number(g._sum.cost ?? 0)]),
  );
  const maintMap = new Map(
    maintGroups.map((g) => [g.vehicleId, Number(g._sum.cost ?? 0)]),
  );

  const rows: VehicleROIRow[] = vehicles.map((v) => {
    const acquisitionCost = Number(v.acquisitionCost ?? 0);
    const revenue = revenueMap.get(v.id) ?? 0;
    const fuelCost = fuelMap.get(v.id) ?? 0;
    const maintenanceCost = maintMap.get(v.id) ?? 0;

    let roi: number | null = null;
    let roiNullReason: string | undefined;

    if (acquisitionCost <= 0) {
      roiNullReason =
        acquisitionCost === 0
          ? "acquisitionCost is 0 — cannot divide by zero"
          : "acquisitionCost is negative — ROI is undefined";
    } else {
      const rawRoi = (revenue - (maintenanceCost + fuelCost)) / acquisitionCost;
      roi = Math.round(rawRoi * 10000) / 10000;
    }

    return {
      vehicleId: v.id,
      vehicleName: v.name,
      revenue,
      maintenanceCost,
      fuelCost,
      acquisitionCost,
      roi,
      ...(roiNullReason ? { roiNullReason } : {}),
    };
  });

  // Non-null ROI descending; null rows at the end
  rows.sort((a, b) => {
    if (a.roi === null && b.roi === null) return 0;
    if (a.roi === null) return 1;
    if (b.roi === null) return -1;
    return b.roi - a.roi;
  });

  return rows;
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. exportReportCSV
//
// Reuses the corresponding report service function — no duplicated aggregation.
// Streams row-by-row into `res` using res.write() so the full CSV string is
// never assembled in application memory.
// ─────────────────────────────────────────────────────────────────────────────
export async function exportReportCSV(
  filters: ExportCSVInput,
  res: Response,
): Promise<void> {
  const { reportType, vehicleId, startDate, endDate, groupBy } = filters;

  const filename = `${reportType}-report-${Date.now()}.csv`;
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

  type CsvRow = Record<string, unknown>;
  let headers: string[];
  let rows: CsvRow[];

  switch (reportType) {
    case "fuelEfficiency": {
      headers = ["vehicleId", "vehicleName", "efficiency"];
      rows = await getFuelEfficiencyReport({ vehicleId, startDate, endDate });
      break;
    }

    case "fleetUtilization": {
      const report = await getFleetUtilizationReport({
        startDate,
        endDate,
        groupBy,
      });
      if (report.mode === "point-in-time") {
        headers = [
          "mode",
          "fleetUtilization",
          "nonRetiredVehicles",
          "onTripVehicles",
        ];
        rows = [report];
      } else {
        headers = ["period", "utilization"];
        rows = report.timeSeries;
      }
      break;
    }

    case "operationalCost": {
      headers = [
        "vehicleId",
        "vehicleName",
        "fuelCost",
        "maintenanceCost",
        "totalOperationalCost",
      ];
      rows = await getOperationalCostReport({ vehicleId, startDate, endDate });
      break;
    }

    case "roi": {
      headers = [
        "vehicleId",
        "vehicleName",
        "revenue",
        "maintenanceCost",
        "fuelCost",
        "acquisitionCost",
        "roi",
        "roiNullReason",
      ];
      rows = await getVehicleROIReport({ vehicleId, startDate, endDate });
      break;
    }

    default:
      throw new InvalidInputError(
        `Unsupported reportType "${reportType}". ` +
          `Valid values are: fuelEfficiency, fleetUtilization, operationalCost, roi.`,
      );
  }

  // ── Stream header row ─────────────────────────────────────────────────────
  res.write(headers.map(toCsvCell).join(",") + "\r\n");

  // ── Stream data rows one at a time ────────────────────────────────────────
  for (const row of rows) {
    const line = headers.map((h) => toCsvCell(row[h])).join(",") + "\r\n";
    res.write(line);
  }

  res.end();
}
