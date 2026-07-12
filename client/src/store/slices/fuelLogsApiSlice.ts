import { apiSlice } from "../apiSlice";
import {
  FuelLog,
  ApiResponse,
  PaginatedResponse,
  CreateFuelLogInput,
  UpdateFuelLogInput,
  ListFuelLogsParams,
} from "@/types/api";

export interface VehicleFuelStats {
  vehicleId: string;
  totalLiters: number;
  totalCost: number;
  averageCostPerLiter: number;
  fuelLogCount: number;
}

export const fuelLogsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    listFuelLogs: builder.query<ApiResponse<PaginatedResponse<FuelLog>>, ListFuelLogsParams>({
      query: (params = {}) => ({
        url: "/fuel-logs/list",
        params: {
          page: params.page ?? 1,
          limit: params.limit ?? 10,
          ...(params.vehicleId && { vehicleId: params.vehicleId }),
          ...(params.tripId && { tripId: params.tripId }),
          ...(params.startDate && { startDate: params.startDate }),
          ...(params.endDate && { endDate: params.endDate }),
        },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.docs.map(({ id }) => ({ type: "FuelLog" as const, id })),
              { type: "FuelLog" as const, id: "LIST" },
            ]
          : [{ type: "FuelLog" as const, id: "LIST" }],
    }),
    getFuelLogById: builder.query<ApiResponse<FuelLog>, string>({
      query: (id) => `/fuel-logs/${id}`,
      providesTags: (result, error, id) => [{ type: "FuelLog", id }],
    }),
    createFuelLog: builder.mutation<ApiResponse<FuelLog>, CreateFuelLogInput>({
      query: (data) => ({
        url: "/fuel-logs/create",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [
        { type: "FuelLog", id: "LIST" },
        { type: "Dashboard" },
      ],
    }),
    updateFuelLog: builder.mutation<ApiResponse<FuelLog>, { id: string; data: UpdateFuelLogInput }>({
      query: ({ id, data }) => ({
        url: `/fuel-logs/update/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "FuelLog", id },
        { type: "FuelLog", id: "LIST" },
      ],
    }),
    deleteFuelLog: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({
        url: `/fuel-logs/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "FuelLog", id: "LIST" }],
    }),
    getVehicleFuelStats: builder.query<
      ApiResponse<VehicleFuelStats>,
      { vehicleId: string; startDate?: string; endDate?: string }
    >({
      query: ({ vehicleId, startDate, endDate }) => ({
        url: `/fuel-logs/stats/${vehicleId}`,
        params: {
          ...(startDate && { startDate }),
          ...(endDate && { endDate }),
        },
      }),
      providesTags: (result, error, { vehicleId }) => [{ type: "FuelLog", id: vehicleId }],
    }),
  }),
});

export const {
  useListFuelLogsQuery,
  useGetFuelLogByIdQuery,
  useCreateFuelLogMutation,
  useUpdateFuelLogMutation,
  useDeleteFuelLogMutation,
  useGetVehicleFuelStatsQuery,
} = fuelLogsApiSlice;
