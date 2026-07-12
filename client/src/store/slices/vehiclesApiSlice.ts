import { apiSlice } from "../apiSlice";
import {
  Vehicle,
  ApiResponse,
  CreateVehicleInput,
  UpdateVehicleInput,
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
    // NOTE: GET /vehicles is not yet implemented in the backend
    // It is mapped here for forward compatibility once the route is added
    getVehicles: builder.query<ApiResponse<Vehicle[]>, void>({
      query: () => "/vehicles",
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: "Vehicle" as const, id })),
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
