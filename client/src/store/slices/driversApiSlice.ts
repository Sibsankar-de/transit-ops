import { apiSlice } from "../apiSlice";
import {
  Driver,
  ApiResponse,
  PaginatedResponse,
  CreateDriverInput,
  UpdateDriverInput,
  ListDriversParams,
} from "@/types/api";

export const driversApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDrivers: builder.query<ApiResponse<PaginatedResponse<Driver>>, ListDriversParams>({
      query: (params = {}) => ({
        url: "/drivers",
        params: { page: params.page ?? 1, limit: params.limit ?? 10 },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.docs.map(({ id }) => ({ type: "Driver" as const, id })),
              { type: "Driver" as const, id: "LIST" },
            ]
          : [{ type: "Driver" as const, id: "LIST" }],
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
      invalidatesTags: [{ type: "Driver", id: "LIST" }],
    }),
    updateDriver: builder.mutation<ApiResponse<Driver>, { id: string; data: UpdateDriverInput }>({
      query: ({ id, data }) => ({
        url: `/drivers/update/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Driver", id },
        { type: "Driver", id: "LIST" },
      ],
    }),
    deleteDriver: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({
        url: `/drivers/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Driver", id: "LIST" }],
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
