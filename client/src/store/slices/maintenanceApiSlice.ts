import { apiSlice } from "../apiSlice";
import {
  MaintenanceLog,
  ApiResponse,
  PaginatedResponse,
  CreateMaintenanceLogInput,
  UpdateMaintenanceLogInput,
  ListMaintenanceLogsParams,
} from "@/types/api";

export const maintenanceApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    listMaintenanceLogs: builder.query<
      ApiResponse<PaginatedResponse<MaintenanceLog>>,
      ListMaintenanceLogsParams
    >({
      query: (params = {}) => ({
        url: "/maintenance",
        params: {
          page: params.page ?? 1,
          limit: params.limit ?? 10,
          ...(params.vehicleId && { vehicleId: params.vehicleId }),
          ...(params.status && { status: params.status }),
          ...(params.dateFrom && { dateFrom: params.dateFrom }),
          ...(params.dateTo && { dateTo: params.dateTo }),
          ...(params.search && { search: params.search }),
          ...(params.sortBy && { sortBy: params.sortBy }),
          ...(params.sortOrder && { sortOrder: params.sortOrder }),
        },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.docs.map(({ id }) => ({ type: "MaintenanceLog" as const, id })),
              { type: "MaintenanceLog" as const, id: "LIST" },
            ]
          : [{ type: "MaintenanceLog" as const, id: "LIST" }],
    }),
    getMaintenanceLogById: builder.query<ApiResponse<MaintenanceLog>, string>({
      query: (id) => `/maintenance/${id}`,
      providesTags: (result, error, id) => [{ type: "MaintenanceLog", id }],
    }),
    createMaintenanceLog: builder.mutation<ApiResponse<MaintenanceLog>, CreateMaintenanceLogInput>({
      query: (data) => ({
        url: "/maintenance",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [
        { type: "MaintenanceLog", id: "LIST" },
        { type: "Vehicle", id: "LIST" },
        { type: "Dashboard" },
      ],
    }),
    updateMaintenanceLog: builder.mutation<
      ApiResponse<MaintenanceLog>,
      { id: string; data: UpdateMaintenanceLogInput }
    >({
      query: ({ id, data }) => ({
        url: `/maintenance/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "MaintenanceLog", id },
        { type: "MaintenanceLog", id: "LIST" },
      ],
    }),
    closeMaintenanceLog: builder.mutation<ApiResponse<MaintenanceLog>, string>({
      query: (id) => ({
        url: `/maintenance/${id}/close`,
        method: "PATCH",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "MaintenanceLog", id },
        { type: "MaintenanceLog", id: "LIST" },
        { type: "Vehicle", id: "LIST" },
        { type: "Dashboard" },
      ],
    }),
    getVehicleMaintenanceCost: builder.query<
      ApiResponse<{ totalCost: number }>,
      { vehicleId: string; dateFrom?: string; dateTo?: string }
    >({
      query: ({ vehicleId, dateFrom, dateTo }) => ({
        url: `/maintenance/vehicles/${vehicleId}/cost`,
        params: {
          ...(dateFrom && { dateFrom }),
          ...(dateTo && { dateTo }),
        },
      }),
      providesTags: (result, error, { vehicleId }) => [{ type: "MaintenanceLog", id: vehicleId }],
    }),
  }),
});

export const {
  useListMaintenanceLogsQuery,
  useGetMaintenanceLogByIdQuery,
  useCreateMaintenanceLogMutation,
  useUpdateMaintenanceLogMutation,
  useCloseMaintenanceLogMutation,
  useGetVehicleMaintenanceCostQuery,
} = maintenanceApiSlice;
