import { StatusCodes } from "http-status-codes";
import { prisma } from "../lib/prisma";
import { ApiError } from "../utils/ApiError";
import { toSafeExpense } from "../dto/expense.dto";
import { ExpenseModel } from "../types/expense.types";
import { PaginatedResponse } from "../types/pagination.types";
import {
  CreateExpenseInput,
  UpdateExpenseInput,
  ListExpensesQuery,
} from "../schemas/expense.schema";
import { ExpenseType } from "@prisma/client";

export async function createExpense(
  data: CreateExpenseInput,
): Promise<ExpenseModel> {
  if (data.amount <= 0) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Amount must be greater than 0",
    );
  }

  if (new Date(data.date) > new Date()) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Date cannot be in the future");
  }

  const vehicle = await prisma.vehicle.findUnique({
    where: { id: data.vehicleId },
  });
  if (!vehicle) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Vehicle not found");
  }

  const expense = await prisma.expense.create({
    data: {
      vehicleId: data.vehicleId,
      type: data.type as ExpenseType,
      amount: data.amount,
      date: data.date,
      description: data.description || null,
    },
  });

  return toSafeExpense(expense);
}

export async function updateExpense(
  expenseId: string,
  data: UpdateExpenseInput,
): Promise<ExpenseModel> {
  if (data.amount !== undefined && data.amount <= 0) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Amount must be greater than 0",
    );
  }

  if (data.date !== undefined && new Date(data.date) > new Date()) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Date cannot be in the future");
  }

  const existing = await prisma.expense.findUnique({
    where: { id: expenseId },
  });
  if (!existing) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Expense not found");
  }

  const updated = await prisma.expense.update({
    where: { id: expenseId },
    data: {
      type: data.type as ExpenseType,
      amount: data.amount,
      date: data.date,
      description: data.description,
    },
  });

  return toSafeExpense(updated);
}

export async function deleteExpense(expenseId: string): Promise<void> {
  const existing = await prisma.expense.findUnique({
    where: { id: expenseId },
  });
  if (!existing) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Expense not found");
  }

  await prisma.expense.delete({ where: { id: expenseId } });
}

export async function getExpense(expenseId: string): Promise<ExpenseModel> {
  const expense = await prisma.expense.findUnique({
    where: { id: expenseId },
    include: { vehicle: true },
  });
  if (!expense) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Expense not found");
  }
  return toSafeExpense(expense);
}

export async function listExpenses(
  query: ListExpensesQuery,
): Promise<PaginatedResponse<ExpenseModel>> {
  const where: any = {};
  if (query.vehicleId) where.vehicleId = query.vehicleId;
  if (query.type) where.type = query.type;
  if (query.startDate || query.endDate) {
    where.date = {};
    if (query.startDate) where.date.gte = query.startDate;
    if (query.endDate) where.date.lte = query.endDate;
  }
  if (query.search) {
    where.description = { contains: query.search, mode: "insensitive" };
  }
  if (query.amountMin !== undefined || query.amountMax !== undefined) {
    where.amount = {
      ...(query.amountMin !== undefined ? { gte: query.amountMin } : {}),
      ...(query.amountMax !== undefined ? { lte: query.amountMax } : {}),
    };
  }

  const skip = (query.page - 1) * query.limit;
  const orderBy = { [query.sortBy]: query.sortOrder };

  const [total, expenses] = await prisma.$transaction([
    prisma.expense.count({ where }),
    prisma.expense.findMany({
      where,
      skip,
      take: query.limit,
      orderBy,
      include: { vehicle: true },
    }),
  ]);

  return {
    docs: expenses.map(toSafeExpense),
    limit: query.limit,
    page: query.page,
    totalDocs: total,
    totalPages: Math.ceil(total / query.limit),
  };
}

export async function getVehicleExpenseTotal(
  vehicleId: string,
  type?: ExpenseType,
  startDate?: Date,
  endDate?: Date,
): Promise<number> {
  const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
  if (!vehicle) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Vehicle not found");
  }

  const where: any = { vehicleId };
  if (type) where.type = type;
  if (startDate || endDate) {
    where.date = {};
    if (startDate) where.date.gte = startDate;
    if (endDate) where.date.lte = endDate;
  }

  const aggregate = await prisma.expense.aggregate({
    where,
    _sum: {
      amount: true,
    },
  });

  return Number(aggregate._sum.amount ?? 0);
}

export async function getVehicleOperationalCost(
  vehicleId: string,
  startDate?: Date,
  endDate?: Date,
  includeOther = false,
) {
  const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
  if (!vehicle) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Vehicle not found");
  }

  const fuelLogWhere: any = { vehicleId };
  if (startDate || endDate) {
    fuelLogWhere.date = {};
    if (startDate) fuelLogWhere.date.gte = startDate;
    if (endDate) fuelLogWhere.date.lte = endDate;
  }
  const fuelAggregate = await prisma.fuelLog.aggregate({
    where: fuelLogWhere,
    _sum: { cost: true },
  });
  const fuelCost = Number(fuelAggregate._sum.cost ?? 0);

  const maintWhere: any = { vehicleId };
  if (startDate || endDate) {
    maintWhere.startDate = {};
    if (startDate) maintWhere.startDate.gte = startDate;
    if (endDate) maintWhere.startDate.lte = endDate;
  }
  const maintAggregate = await prisma.maintenanceLog.aggregate({
    where: maintWhere,
    _sum: { cost: true },
  });
  const maintenanceCost = Number(maintAggregate._sum.cost ?? 0);

  let otherExpensesCost = 0;
  if (includeOther) {
    const expenseWhere: any = {
      vehicleId,
      type: { in: [ExpenseType.TOLL, ExpenseType.OTHER] },
    };
    if (startDate || endDate) {
      expenseWhere.date = {};
      if (startDate) expenseWhere.date.gte = startDate;
      if (endDate) expenseWhere.date.lte = endDate;
    }
    const expenseAggregate = await prisma.expense.aggregate({
      where: expenseWhere,
      _sum: { amount: true },
    });
    otherExpensesCost = Number(expenseAggregate._sum.amount ?? 0);
  }

  const totalOperationalCost = fuelCost + maintenanceCost + otherExpensesCost;

  return {
    fuelCost,
    maintenanceCost,
    totalOperationalCost,
  };
}
