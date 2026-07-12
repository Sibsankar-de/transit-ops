export type FuelEfficiencyRow = {
  vehicleId: string;
  vehicleName: string;
  efficiency: number | null;
};

export type FleetUtilizationPointInTime = {
  mode: "point-in-time";
  fleetUtilization: number;
  nonRetiredVehicles: number;
  onTripVehicles: number;
};

export type FleetUtilizationTimeSeriesEntry = {
  period: string;
  utilization: number;
};

export type FleetUtilizationTimeSeries = {
  mode: "time-series";
  nonRetiredVehicles: number;
  timeSeries: FleetUtilizationTimeSeriesEntry[];
};

export type FleetUtilizationReport =
  FleetUtilizationPointInTime | FleetUtilizationTimeSeries;

export type OperationalCostRow = {
  vehicleId: string;
  vehicleName: string;
  fuelCost: number;
  maintenanceCost: number;
  totalOperationalCost: number;
};

export type VehicleROIRow = {
  vehicleId: string;
  vehicleName: string;
  revenue: number;
  maintenanceCost: number;
  fuelCost: number;
  acquisitionCost: number;
  roi: number | null;
  roiNullReason?: string;
};
