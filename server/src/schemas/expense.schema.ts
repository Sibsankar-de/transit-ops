import { z } from "zod";
import { ExpenseType } from "@prisma/client";
import { paginationQuerySchema, sortOrderSchema } from "./pagination.schema";

const expenseTypeValues = Object.values(ExpenseType) as [string, ...string[]];

export const createExpenseSchema = z.object({
  vehicleId: z.uuid("Invalid vehicle ID"),
  type: z.enum(expenseTypeValues, { message: "Invalid expense type" }),
  amount: z.number().positive("Amount must be greater than 0"),
  date: z.coerce.date().refine((d) => d <= new Date(), {
    message: "Date cannot be in the future",
  }),
  description: z.string().optional().nullable(),
});

export const updateExpenseSchema = z.object({
  type: z
    .enum(expenseTypeValues, { message: "Invalid expense type" })
    .optional(),
  amount: z.number().positive("Amount must be greater than 0").optional(),
  date: z.coerce
    .date()
    .refine((d) => d <= new Date(), {
      message: "Date cannot be in the future",
    })
    .optional(),
  description: z.string().optional().nullable(),
});

const expenseSortFields = ["date", "amount", "createdAt"] as const;

export const listExpensesQuerySchema = z
  .object({
    vehicleId: z.uuid("Invalid vehicle ID").optional(),
    type: z.enum(expenseTypeValues).optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    search: z.string().optional(),
    amountMin: z.coerce.number().nonnegative().optional(),
    amountMax: z.coerce.number().nonnegative().optional(),
    sortBy: z.enum(expenseSortFields).default("date"),
    sortOrder: sortOrderSchema,
  })
  .merge(paginationQuerySchema);

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
export type ListExpensesQuery = z.infer<typeof listExpensesQuerySchema>;
