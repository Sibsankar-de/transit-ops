import { apiSlice } from "../apiSlice";
import {
  Vehicle,
  ApiResponse,
  PaginatedResponse,
  CreateVehicleInput,
  UpdateVehicleInput,
  ListVehiclesParams,
} from "@/types/api";

export const vehiclesApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createVehicle: builder.mutation<ApiResponse<Vehicle>, CreateVehicleInput>({
      query: (vehicleData) => ({
        url: "/vehicles/create",
        method: "POST",
        body: vehicleData,
      }),
      invalidatesTags: [{ type: "Vehicle", id: "LIST" }],
    }),
    updateVehicle: builder.mutation<ApiResponse<Vehicle>, { id: string; data: UpdateVehicleInput }>({
      query: ({ id, data }) => ({
        url: `/vehicles/update/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Vehicle", id },
        { type: "Vehicle", id: "LIST" },
      ],
    }),
    deleteVehicle: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({
        url: `/vehicles/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Vehicle", id: "LIST" }],
    }),
    getVehicles: builder.query<ApiResponse<PaginatedResponse<Vehicle>>, ListVehiclesParams>({
      query: (params = {}) => ({
        url: "/vehicles",
        params: {
          page: params.page ?? 1,
          limit: params.limit ?? 10,
          ...(params.search && { search: params.search }),
          ...(params.status && { status: params.status }),
          ...(params.type && { type: params.type }),
          ...(params.region && { region: params.region }),
          ...(params.sortBy && { sortBy: params.sortBy }),
          ...(params.sortOrder && { sortOrder: params.sortOrder }),
        },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.docs.map(({ id }) => ({ type: "Vehicle" as const, id })),
              { type: "Vehicle" as const, id: "LIST" },
            ]
          : [{ type: "Vehicle" as const, id: "LIST" }],
    }),
  }),
});

export const {
  useCreateVehicleMutation,
  useUpdateVehicleMutation,
  useDeleteVehicleMutation,
  useGetVehiclesQuery,
} = vehiclesApiSlice;
