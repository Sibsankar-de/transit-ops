import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { validateBody } from "../utils/validate.utils";
import {
  createExpenseSchema,
  updateExpenseSchema,
  listExpensesQuerySchema,
} from "../schemas/expense.schema";
import {
  createExpense,
  updateExpense,
  deleteExpense,
  getExpense,
  listExpenses,
  getVehicleExpenseTotal,
  getVehicleOperationalCost,
} from "../service/expense.service";
import { ExpenseType } from "@prisma/client";

export const createExpenseHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const data = validateBody(createExpenseSchema, req.body);
    const expense = await createExpense(data);
    return res
      .status(StatusCodes.CREATED)
      .json(
        new ApiResponse(
          StatusCodes.CREATED,
          expense,
          "Expense created successfully",
        ),
      );
  },
);

export const updateExpenseHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const data = validateBody(updateExpenseSchema, req.body);
    const expense = await updateExpense(req.params.id as string, data);
    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(
          StatusCodes.OK,
          expense,
          "Expense updated successfully",
        ),
      );
  },
);

export const deleteExpenseHandler = asyncHandler(
  async (req: Request, res: Response) => {
    await deleteExpense(req.params.id as string);
    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(StatusCodes.OK, null, "Expense deleted successfully"),
      );
  },
);

export const getExpenseHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const expense = await getExpense(req.params.id as string);
    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(
          StatusCodes.OK,
          expense,
          "Expense retrieved successfully",
        ),
      );
  },
);

export const listExpensesHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const query = validateBody(listExpensesQuerySchema, req.query);
    const result = await listExpenses(query);
    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(StatusCodes.OK, result, "Expenses listed successfully"),
      );
  },
);

export const getVehicleExpenseTotalHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const { type, startDate, endDate } = req.query;
    const total = await getVehicleExpenseTotal(
      req.params.vehicleId as string,
      type ? ((type as string).toUpperCase() as ExpenseType) : undefined,
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined,
    );
    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(
          StatusCodes.OK,
          { total },
          "Vehicle expense total retrieved successfully",
        ),
      );
  },
);

export const getVehicleOperationalCostHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const { startDate, endDate, includeOther } = req.query;
    const cost = await getVehicleOperationalCost(
      req.params.vehicleId as string,
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined,
      includeOther === "true",
    );
    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(
          StatusCodes.OK,
          cost,
          "Operational cost calculated successfully",
        ),
      );
  },
);
