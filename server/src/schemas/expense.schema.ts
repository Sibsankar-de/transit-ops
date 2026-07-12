import { z } from "zod";
import { ExpenseType } from "@prisma/client";

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

export const listExpensesQuerySchema = z.object({
  vehicleId: z.uuid("Invalid vehicle ID").optional(),
  type: z.enum(expenseTypeValues).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(10),
});

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
export type ListExpensesQuery = z.infer<typeof listExpensesQuerySchema>;
