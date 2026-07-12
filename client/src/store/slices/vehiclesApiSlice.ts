import { apiSlice } from "../apiSlice";
import { Vehicle, ApiResponse, CreateVehicleInput, UpdateVehicleInput } from "@/types/api";

export const vehiclesApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createVehicle: builder.mutation<ApiResponse<Vehicle>, CreateVehicleInput>({
      query: (vehicleData) => ({
        url: "/vehicles/create",
        method: "POST",
        body: vehicleData,
      }),
      invalidatesTags: ["Vehicle"],
    }),
    updateVehicle: builder.mutation<ApiResponse<Vehicle>, { id: string; data: UpdateVehicleInput }>({
      query: ({ id, data }) => ({
        url: `/vehicles/update/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => ["Vehicle", { type: "Vehicle", id }],
    }),
    deleteVehicle: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({
        url: `/vehicles/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Vehicle"],
    }),

    // Missing in backend - outlined for future use
    getVehicles: builder.query<ApiResponse<Vehicle[]>, void>({
      query: () => "/vehicles", // TODO: backend missing GET /vehicles
      providesTags: ["Vehicle"],
    }),
  }),
});

export const {
  useCreateVehicleMutation,
  useUpdateVehicleMutation,
  useDeleteVehicleMutation,
  useGetVehiclesQuery,
} = vehiclesApiSlice;
