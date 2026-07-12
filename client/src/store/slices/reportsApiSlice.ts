import { apiSlice } from "../apiSlice";
import { ApiResponse } from "@/types/api";

export interface FuelEfficiencyReport {
  vehicleId: string;
  vehicleName: string;
  registrationNumber: string;
  totalFuelConsumed: number;
  totalDistance: number;
  fuelEfficiency: number;
}

export interface FleetUtilizationReport {
  vehicleId: string;
  vehicleName: string;
  registrationNumber: string;
  totalTrips: number;
  activeHours: number;
  utilizationRate: number;
}

export interface OperationalCostReport {
  vehicleId: string;
  vehicleName: string;
  registrationNumber: string;
  fuelCost: number;
  maintenanceCost: number;
  otherExpenses: number;
  totalCost: number;
}

export interface VehicleROIReport {
  vehicleId: string;
  vehicleName: string;
  registrationNumber: string;
  acquisitionCost: number;
  totalOperationalCost: number;
  revenueGenerated: number;
  roi: number;
}

export const reportsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getFuelEfficiencyReport: builder.query<ApiResponse<FuelEfficiencyReport[]>, void>({
      query: () => "/reports/fuel-efficiency",
      providesTags: [{ type: "Dashboard" }],
    }),
    getFleetUtilizationReport: builder.query<ApiResponse<FleetUtilizationReport[]>, void>({
      query: () => "/reports/fleet-utilization",
      providesTags: [{ type: "Dashboard" }],
    }),
    getOperationalCostReport: builder.query<ApiResponse<OperationalCostReport[]>, void>({
      query: () => "/reports/operational-cost",
      providesTags: [{ type: "Dashboard" }],
    }),
    getVehicleROIReport: builder.query<ApiResponse<VehicleROIReport[]>, void>({
      query: () => "/reports/roi",
      providesTags: [{ type: "Dashboard" }],
    }),
    exportReportCSV: builder.query<Blob, { type: string; startDate?: string; endDate?: string }>({
      query: (params) => ({
        url: "/reports/export",
        params,
        responseHandler: (response) => response.blob(),
      }),
    }),
  }),
});

export const {
  useGetFuelEfficiencyReportQuery,
  useGetFleetUtilizationReportQuery,
  useGetOperationalCostReportQuery,
  useGetVehicleROIReportQuery,
  useExportReportCSVQuery,
} = reportsApiSlice;
