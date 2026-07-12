import { z } from "zod";

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(10),
});

export const sortOrderSchema = z.enum(["asc", "desc"]).default("desc");

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;
