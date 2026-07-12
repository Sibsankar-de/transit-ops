import { apiSlice } from "../apiSlice";
import { DashboardKPIs, ApiResponse } from "@/types/api";

export const dashboardApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardKPIs: builder.query<ApiResponse<DashboardKPIs>, void>({
      query: () => "/dashboard/kpis",
      providesTags: [{ type: "Dashboard" }],
    }),
  }),
});

export const { useGetDashboardKPIsQuery } = dashboardApiSlice;
