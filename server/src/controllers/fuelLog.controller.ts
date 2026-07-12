import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { validateBody } from "../utils/validate.utils";
import {
  createFuelLogSchema,
  updateFuelLogSchema,
  listFuelLogsQuerySchema,
} from "../schemas/fuelLog.schema";
import {
  createFuelLog,
  updateFuelLog,
  deleteFuelLog,
  getFuelLog,
  listFuelLogs,
  getVehicleFuelStats,
} from "../service/fuelLog.service";

export const createFuelLogHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const data = validateBody(createFuelLogSchema, req.body);
    const log = await createFuelLog(data);
    return res
      .status(StatusCodes.CREATED)
      .json(
        new ApiResponse(
          StatusCodes.CREATED,
          log,
          "Fuel log created successfully",
        ),
      );
  },
);

export const updateFuelLogHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const data = validateBody(updateFuelLogSchema, req.body);
    const log = await updateFuelLog(req.params.id as string, data);
    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(StatusCodes.OK, log, "Fuel log updated successfully"),
      );
  },
);

export const deleteFuelLogHandler = asyncHandler(
  async (req: Request, res: Response) => {
    await deleteFuelLog(req.params.id as string);
    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(StatusCodes.OK, null, "Fuel log deleted successfully"),
      );
  },
);

export const getFuelLogHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const log = await getFuelLog(req.params.id as string);
    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(StatusCodes.OK, log, "Fuel log retrieved successfully"),
      );
  },
);

export const listFuelLogsHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const query = validateBody(listFuelLogsQuerySchema, req.query);
    const result = await listFuelLogs(query);
    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(
          StatusCodes.OK,
          result,
          "Fuel logs listed successfully",
        ),
      );
  },
);

export const getVehicleFuelStatsHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const { startDate, endDate } = req.query;
    const stats = await getVehicleFuelStats(
      req.params.vehicleId as string,
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined,
    );
    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(
          StatusCodes.OK,
          stats,
          "Vehicle fuel stats retrieved successfully",
        ),
      );
  },
);
