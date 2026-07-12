import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { validateBody } from "../utils/validate.utils";
import {
  createVehicleSchema,
  updateVehicleSchema,
} from "../schemas/vehicle.schema";
import {
  createVehicle,
  updateVehicle,
  deleteVehicle,
} from "../service/vehicle.service";

export const createVehicleHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const data = validateBody(createVehicleSchema, req.body);
    const vehicle = await createVehicle(data);

    return res
      .status(StatusCodes.CREATED)
      .json(
        new ApiResponse(
          StatusCodes.CREATED,
          vehicle,
          "Vehicle created successfully",
        ),
      );
  },
);

export const updateVehicleHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const data = validateBody(updateVehicleSchema, req.body);
    const vehicle = await updateVehicle(req.params.id as string, data);

    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(
          StatusCodes.OK,
          vehicle,
          "Vehicle updated successfully",
        ),
      );
  },
);

export const deleteVehicleHandler = asyncHandler(
  async (req: Request, res: Response) => {
    await deleteVehicle(req.params.id as string);

    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(StatusCodes.OK, null, "Vehicle deleted successfully"),
      );
  },
);
