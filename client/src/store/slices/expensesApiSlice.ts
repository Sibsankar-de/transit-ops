import { apiSlice } from "../apiSlice";
import {
  Expense,
  ApiResponse,
  PaginatedResponse,
  CreateExpenseInput,
  UpdateExpenseInput,
  ListExpensesParams,
} from "@/types/api";

export const expensesApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    listExpenses: builder.query<ApiResponse<PaginatedResponse<Expense>>, ListExpensesParams>({
      query: (params = {}) => ({
        url: "/expenses/list",
        params: {
          page: params.page ?? 1,
          limit: params.limit ?? 10,
          ...(params.vehicleId && { vehicleId: params.vehicleId }),
          ...(params.type && { type: params.type }),
          ...(params.startDate && { startDate: params.startDate }),
          ...(params.endDate && { endDate: params.endDate }),
          ...(params.search && { search: params.search }),
          ...(params.sortBy && { sortBy: params.sortBy }),
          ...(params.sortOrder && { sortOrder: params.sortOrder }),
        },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.docs.map(({ id }) => ({ type: "Expense" as const, id })),
              { type: "Expense" as const, id: "LIST" },
            ]
          : [{ type: "Expense" as const, id: "LIST" }],
    }),
    getExpenseById: builder.query<ApiResponse<Expense>, string>({
      query: (id) => `/expenses/${id}`,
      providesTags: (result, error, id) => [{ type: "Expense", id }],
    }),
    createExpense: builder.mutation<ApiResponse<Expense>, CreateExpenseInput>({
      query: (data) => ({
        url: "/expenses/create",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [
        { type: "Expense", id: "LIST" },
        { type: "Dashboard" },
      ],
    }),
    updateExpense: builder.mutation<ApiResponse<Expense>, { id: string; data: UpdateExpenseInput }>({
      query: ({ id, data }) => ({
        url: `/expenses/update/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Expense", id },
        { type: "Expense", id: "LIST" },
      ],
    }),
    deleteExpense: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({
        url: `/expenses/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Expense", id: "LIST" }],
    }),
    getVehicleExpenseTotal: builder.query<
      ApiResponse<{ total: number }>,
      string
    >({
      query: (vehicleId) => `/expenses/total/${vehicleId}`,
      providesTags: (result, error, vehicleId) => [{ type: "Expense", id: vehicleId }],
    }),
    getVehicleOperationalCost: builder.query<
      ApiResponse<{ operationalCost: number }>,
      string
    >({
      query: (vehicleId) => `/expenses/operational-cost/${vehicleId}`,
      providesTags: (result, error, vehicleId) => [{ type: "Expense", id: vehicleId }],
    }),
  }),
});

export const {
  useListExpensesQuery,
  useGetExpenseByIdQuery,
  useCreateExpenseMutation,
  useUpdateExpenseMutation,
  useDeleteExpenseMutation,
  useGetVehicleExpenseTotalQuery,
  useGetVehicleOperationalCostQuery,
} = expensesApiSlice;
