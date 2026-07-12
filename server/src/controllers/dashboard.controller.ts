import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { validateBody } from "../utils/validate.utils";
import { dashboardKPISchema } from "../schemas/dashboard.schema";
import { getDashboardKPIs } from "../service/dashboard.service";

export const getDashboardKPIsHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const filters = validateBody(dashboardKPISchema, req.query);
    const kpis = await getDashboardKPIs(filters);

    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(
          StatusCodes.OK,
          kpis,
          "Dashboard KPIs fetched successfully",
        ),
      );
  },
);
