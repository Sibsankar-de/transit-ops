import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { validateBody } from "../utils/validate.utils";
import {
  createDriverSchema,
  updateDriverSchema,
} from "../schemas/driver.schema";
import {
  createDriver,
  getDriverById,
  getAllDrivers,
  updateDriver,
  deleteDriver,
} from "../service/driver.service";

export const createDriverHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const data = validateBody(createDriverSchema, req.body);
    const driver = await createDriver(data);

    return res
      .status(StatusCodes.CREATED)
      .json(
        new ApiResponse(
          StatusCodes.CREATED,
          driver,
          "Driver created successfully",
        ),
      );
  },
);

export const getDriverByIdHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const driver = await getDriverById(req.params.id as string);

    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(StatusCodes.OK, driver, "Driver fetched successfully"),
      );
  },
);

export const getAllDriversHandler = asyncHandler(
  async (_req: Request, res: Response) => {
    const drivers = await getAllDrivers();

    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(
          StatusCodes.OK,
          drivers,
          "Drivers fetched successfully",
        ),
      );
  },
);

export const updateDriverHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const data = validateBody(updateDriverSchema, req.body);
    const driver = await updateDriver(req.params.id as string, data);

    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(StatusCodes.OK, driver, "Driver updated successfully"),
      );
  },
);

export const deleteDriverHandler = asyncHandler(
  async (req: Request, res: Response) => {
    await deleteDriver(req.params.id as string);

    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(StatusCodes.OK, null, "Driver deleted successfully"),
      );
  },
);
