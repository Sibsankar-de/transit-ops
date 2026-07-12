import { z } from "zod";
import { paginationQuerySchema } from "./pagination.schema";

export const createFuelLogSchema = z.object({
  vehicleId: z.uuid("Invalid vehicle ID"),
  tripId: z.uuid("Invalid trip ID").optional().nullable(),
  liters: z.number().positive("Liters must be greater than 0"),
  cost: z.number().positive("Cost must be greater than 0"),
  date: z.coerce.date().refine((d) => d <= new Date(), {
    message: "Date cannot be in the future",
  }),
});

export const updateFuelLogSchema = z.object({
  liters: z.number().positive("Liters must be greater than 0").optional(),
  cost: z.number().positive("Cost must be greater than 0").optional(),
  date: z.coerce
    .date()
    .refine((d) => d <= new Date(), {
      message: "Date cannot be in the future",
    })
    .optional(),
});

export const listFuelLogsQuerySchema = z.object({
  vehicleId: z.string().uuid("Invalid vehicle ID").optional(),
  tripId: z.string().uuid("Invalid trip ID").optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
}).merge(paginationQuerySchema);

export type CreateFuelLogInput = z.infer<typeof createFuelLogSchema>;
export type UpdateFuelLogInput = z.infer<typeof updateFuelLogSchema>;
export type ListFuelLogsQuery = z.infer<typeof listFuelLogsQuerySchema>;
