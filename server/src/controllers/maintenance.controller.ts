import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { validateBody } from "../utils/validate.utils";
import {
  createMaintenanceLogSchema,
  closeMaintenanceLogSchema,
  updateMaintenanceLogSchema,
  listMaintenanceLogsSchema,
  vehicleMaintenanceCostSchema,
} from "../schemas/maintenance.schema";
import {
  createMaintenanceLog,
  closeMaintenanceLog,
  updateMaintenanceLog,
  getMaintenanceLog,
  listMaintenanceLogs,
  getVehicleMaintenanceCost,
} from "../service/maintenance.service";

export const createMaintenanceLogHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const data = validateBody(createMaintenanceLogSchema, req.body);
    const log = await createMaintenanceLog(data);

    return res
      .status(StatusCodes.CREATED)
      .json(new ApiResponse(StatusCodes.CREATED, log, "Maintenance log created successfully"));
  },
);

export const closeMaintenanceLogHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const data = validateBody(closeMaintenanceLogSchema, req.body);
    const log = await closeMaintenanceLog(req.params.id as string, data);

    return res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, log, "Maintenance log closed successfully"));
  },
);

export const updateMaintenanceLogHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const data = validateBody(updateMaintenanceLogSchema, req.body);
    const log = await updateMaintenanceLog(req.params.id as string, data);

    return res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, log, "Maintenance log updated successfully"));
  },
);

export const getMaintenanceLogHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const log = await getMaintenanceLog(req.params.id as string);

    return res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, log, "Maintenance log fetched successfully"));
  },
);

export const listMaintenanceLogsHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const filters = validateBody(listMaintenanceLogsSchema, req.query);
    const result = await listMaintenanceLogs(filters);

    return res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, result, "Maintenance logs fetched successfully"));
  },
);

export const getVehicleMaintenanceCostHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const filters = validateBody(vehicleMaintenanceCostSchema, req.query);
    const result = await getVehicleMaintenanceCost(req.params.vehicleId as string, filters);

    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(StatusCodes.OK, result, "Vehicle maintenance cost fetched successfully"),
      );
  },
);
