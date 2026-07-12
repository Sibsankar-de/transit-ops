import { apiSlice } from "../apiSlice";
import { Driver, ApiResponse, CreateDriverInput, UpdateDriverInput } from "@/types/api";

export const driversApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDrivers: builder.query<ApiResponse<Driver[]>, void>({
      query: () => "/drivers",
      providesTags: ["Driver"],
    }),
    getDriverById: builder.query<ApiResponse<Driver>, string>({
      query: (id) => `/drivers/${id}`,
      providesTags: (result, error, id) => [{ type: "Driver", id }],
    }),
    createDriver: builder.mutation<ApiResponse<Driver>, CreateDriverInput>({
      query: (driverData) => ({
        url: "/drivers/create",
        method: "POST",
        body: driverData,
      }),
      invalidatesTags: ["Driver"],
    }),
    updateDriver: builder.mutation<ApiResponse<Driver>, { id: string; data: UpdateDriverInput }>({
      query: ({ id, data }) => ({
        url: `/drivers/update/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => ["Driver", { type: "Driver", id }],
    }),
    deleteDriver: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({
        url: `/drivers/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Driver"],
    }),
  }),
});

export const {
  useGetDriversQuery,
  useGetDriverByIdQuery,
  useCreateDriverMutation,
  useUpdateDriverMutation,
  useDeleteDriverMutation,
} = driversApiSlice;
