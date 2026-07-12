import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { validateBody } from "../utils/validate.utils";
import {
  createTripSchema,
  completeTripSchema,
  listTripsQuerySchema,
} from "../schemas/trip.schema";
import {
  createTrip,
  dispatchTrip,
  completeTrip as completeTripService,
  cancelTrip,
  getTrip,
  listTrips,
} from "../service/trip.service";

export const createTripHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const data = validateBody(createTripSchema, req.body);
    const trip = await createTrip(req.user!.userId, data);
    return res
      .status(StatusCodes.CREATED)
      .json(
        new ApiResponse(StatusCodes.CREATED, trip, "Trip created successfully"),
      );
  },
);

export const dispatchTripHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const trip = await dispatchTrip(req.params.id as string);
    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(StatusCodes.OK, trip, "Trip dispatched successfully"),
      );
  },
);

export const completeTripHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const data = validateBody(completeTripSchema, req.body);
    const trip = await completeTripService(req.params.id as string, data);
    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(StatusCodes.OK, trip, "Trip completed successfully"),
      );
  },
);

export const cancelTripHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const trip = await cancelTrip(req.params.id as string);
    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(StatusCodes.OK, trip, "Trip cancelled successfully"),
      );
  },
);

export const getTripHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const trip = await getTrip(req.params.id as string);
    return res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, trip, "Trip fetched successfully"));
  },
);

export const listTripsHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const query = validateBody(listTripsQuerySchema, req.query);
    const result = await listTrips(query);
    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(StatusCodes.OK, result, "Trips fetched successfully"),
      );
  },
);
