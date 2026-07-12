import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { validateBody } from "../utils/validate.utils";
import {
  fuelEfficiencySchema,
  fleetUtilizationSchema,
  operationalCostSchema,
  vehicleROISchema,
  exportCSVSchema,
} from "../schemas/reports.schema";
import {
  getFuelEfficiencyReport,
  getFleetUtilizationReport,
  getOperationalCostReport,
  getVehicleROIReport,
  exportReportCSV,
} from "../service/reports.service";

export const getFuelEfficiencyReportHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const filters = validateBody(fuelEfficiencySchema, req.query);
    const data = await getFuelEfficiencyReport(filters);

    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(
          StatusCodes.OK,
          data,
          "Fuel efficiency report fetched successfully",
        ),
      );
  },
);

export const getFleetUtilizationReportHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const filters = validateBody(fleetUtilizationSchema, req.query);
    const data = await getFleetUtilizationReport(filters);

    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(
          StatusCodes.OK,
          data,
          "Fleet utilization report fetched successfully",
        ),
      );
  },
);

export const getOperationalCostReportHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const filters = validateBody(operationalCostSchema, req.query);
    const data = await getOperationalCostReport(filters);

    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(
          StatusCodes.OK,
          data,
          "Operational cost report fetched successfully",
        ),
      );
  },
);

export const getVehicleROIReportHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const filters = validateBody(vehicleROISchema, req.query);
    const data = await getVehicleROIReport(filters);

    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(
          StatusCodes.OK,
          data,
          "Vehicle ROI report fetched successfully",
        ),
      );
  },
);

export const exportReportCSVHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const filters = validateBody(exportCSVSchema, req.query);
    await exportReportCSV(filters, res);
  },
);
