import { apiSlice } from "../apiSlice";
import {
  Trip,
  ApiResponse,
  PaginatedResponse,
  CreateTripInput,
  CompleteTripInput,
  ListTripsParams,
} from "@/types/api";

export const tripsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    listTrips: builder.query<ApiResponse<PaginatedResponse<Trip>>, ListTripsParams>({
      query: (params = {}) => ({
        url: "/trips",
        params: {
          page: params.page ?? 1,
          limit: params.limit ?? 10,
          ...(params.status && { status: params.status }),
          ...(params.vehicleId && { vehicleId: params.vehicleId }),
          ...(params.driverId && { driverId: params.driverId }),
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
              ...result.data.docs.map(({ id }) => ({ type: "Trip" as const, id })),
              { type: "Trip" as const, id: "LIST" },
            ]
          : [{ type: "Trip" as const, id: "LIST" }],
    }),
    getTripById: builder.query<ApiResponse<Trip>, string>({
      query: (id) => `/trips/${id}`,
      providesTags: (result, error, id) => [{ type: "Trip", id }],
    }),
    createTrip: builder.mutation<ApiResponse<Trip>, CreateTripInput>({
      query: (tripData) => ({
        url: "/trips",
        method: "POST",
        body: tripData,
      }),
      invalidatesTags: [
        { type: "Trip", id: "LIST" },
        { type: "Vehicle", id: "LIST" },
        { type: "Driver", id: "LIST" },
      ],
    }),
    dispatchTrip: builder.mutation<ApiResponse<Trip>, string>({
      query: (id) => ({
        url: `/trips/${id}/dispatch`,
        method: "POST",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Trip", id },
        { type: "Trip", id: "LIST" },
        { type: "Vehicle", id: "LIST" },
        { type: "Driver", id: "LIST" },
        { type: "Dashboard" },
      ],
    }),
    completeTrip: builder.mutation<ApiResponse<Trip>, { id: string; data: CompleteTripInput }>({
      query: ({ id, data }) => ({
        url: `/trips/${id}/complete`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Trip", id },
        { type: "Trip", id: "LIST" },
        { type: "Vehicle", id: "LIST" },
        { type: "Driver", id: "LIST" },
        { type: "Dashboard" },
      ],
    }),
    cancelTrip: builder.mutation<ApiResponse<Trip>, string>({
      query: (id) => ({
        url: `/trips/${id}/cancel`,
        method: "POST",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Trip", id },
        { type: "Trip", id: "LIST" },
        { type: "Vehicle", id: "LIST" },
        { type: "Driver", id: "LIST" },
        { type: "Dashboard" },
      ],
    }),
  }),
});

export const {
  useListTripsQuery,
  useGetTripByIdQuery,
  useCreateTripMutation,
  useDispatchTripMutation,
  useCompleteTripMutation,
  useCancelTripMutation,
} = tripsApiSlice;
