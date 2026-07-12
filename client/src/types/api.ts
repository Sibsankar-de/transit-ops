import { DriverStatus } from "@/enums/driverStatus.enum";

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------
export interface PaginatedResponse<T> {
  docs: T[];
  limit: number;
  page: number;
  totalDocs: number;
  totalPages: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

// ---------------------------------------------------------------------------
// Status Enums
// ---------------------------------------------------------------------------
export enum UserStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  SUSPENDED = "SUSPENDED",
}

export enum VehicleStatus {
  AVAILABLE = "AVAILABLE",
  ON_TRIP = "ON_TRIP",
  IN_SHOP = "IN_SHOP",
  RETIRED = "RETIRED",
}

export enum TripStatus {
  DRAFT = "DRAFT",
  DISPATCHED = "DISPATCHED",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export enum MaintenanceStatus {
  OPEN = "OPEN",
  IN_PROGRESS = "IN_PROGRESS",
  CLOSED = "CLOSED",
}

export enum ExpenseType {
  FUEL = "FUEL",
  MAINTENANCE = "MAINTENANCE",
  TOLL = "TOLL",
  INSURANCE = "INSURANCE",
  PERMIT = "PERMIT",
  OTHER = "OTHER",
}

// ---------------------------------------------------------------------------
// Entity Interfaces
// ---------------------------------------------------------------------------
export interface User {
  id: string;
  name: string;
  email: string;
  status: UserStatus;
  roleId: string | null;
  role?: Role | null;
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  id: string;
  name: string;
  permissions: string[];
}

export interface Driver {
  id: string;
  userId: string;
  user?: User;
  licenseNumber: string;
  licenseCategory: string;
  licenseExpiryDate: string;
  safetyScore: number;
  status: DriverStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Vehicle {
  id: string;
  registrationNumber: string;
  name: string;
  type: string;
  maxLoadCapacity: number;
  odometer: number;
  acquisitionCost: number;
  region: string;
  status: VehicleStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Trip {
  id: string;
  vehicleId: string;
  driverId: string;
  vehicle?: Pick<Vehicle, "id" | "registrationNumber" | "name">;
  driver?: Pick<Driver, "id" | "licenseNumber"> & { user?: Pick<User, "id" | "name"> };
  origin: string;
  destination: string;
  scheduledDeparture: string;
  actualDeparture?: string;
  actualArrival?: string;
  initialOdometer: number;
  finalOdometer?: number;
  fuelConsumed?: number;
  distanceCovered?: number;
  status: TripStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MaintenanceLog {
  id: string;
  vehicleId: string;
  vehicle?: Pick<Vehicle, "id" | "registrationNumber" | "name">;
  description: string;
  cost: number;
  startDate: string;
  endDate?: string;
  status: MaintenanceStatus;
  createdAt: string;
  updatedAt: string;
}

export interface FuelLog {
  id: string;
  vehicleId: string;
  tripId?: string;
  vehicle?: Pick<Vehicle, "id" | "registrationNumber" | "name">;
  liters: number;
  cost: number;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface Expense {
  id: string;
  vehicleId: string;
  tripId?: string;
  vehicle?: Pick<Vehicle, "id" | "registrationNumber" | "name">;
  type: ExpenseType;
  amount: number;
  date: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------
export interface DashboardKPIs {
  totalVehicles: number;
  activeTrips: number;
  availableDrivers: number;
  totalExpensesThisMonth: number;
  vehiclesInMaintenance: number;
  completedTripsThisMonth: number;
}

// ---------------------------------------------------------------------------
// API Envelope
// ---------------------------------------------------------------------------
export interface ApiResponse<T> {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;
}

// ---------------------------------------------------------------------------
// User / Auth Input Types
// ---------------------------------------------------------------------------
export interface CreateUserInput {
  name: string;
  email: string;
  password?: string;
}

export interface LoginInput {
  email: string;
  password?: string;
}

export interface UpdateUserInput {
  name: string;
}

export interface UpdatePasswordInput {
  currentPassword?: string;
  newPassword?: string;
}

// ---------------------------------------------------------------------------
// Role Input Types
// ---------------------------------------------------------------------------
export interface CreateRoleInput {
  name: string;
  permissions: string[];
}

export interface UpdateRoleInput {
  name?: string;
  permissions?: string[];
}

// ---------------------------------------------------------------------------
// Driver Input Types
// ---------------------------------------------------------------------------
export interface CreateDriverInput {
  userId: string;
  licenseNumber: string;
  licenseCategory: string;
  licenseExpiryDate: Date | string;
}

export interface UpdateDriverInput {
  licenseNumber?: string;
  licenseCategory?: string;
  licenseExpiryDate?: Date | string;
  safetyScore?: number;
  status?: DriverStatus;
}

export interface ListDriversParams extends PaginationParams {}

// ---------------------------------------------------------------------------
// Vehicle Input Types
// ---------------------------------------------------------------------------
export interface CreateVehicleInput {
  name: string;
  type: string;
  maxLoadCapacity: number;
  odometer?: number;
  acquisitionCost: number;
  region: string;
}

export interface UpdateVehicleInput {
  name?: string;
  type?: string;
  maxLoadCapacity?: number;
  odometer?: number;
  acquisitionCost?: number;
  region?: string;
  status?: VehicleStatus;
}

// ---------------------------------------------------------------------------
// Trip Input Types
// ---------------------------------------------------------------------------
export interface CreateTripInput {
  vehicleId: string;
  driverId: string;
  origin: string;
  destination: string;
  scheduledDeparture: string;
  initialOdometer: number;
  notes?: string;
}

export interface CompleteTripInput {
  finalOdometer: number;
  fuelConsumed: number;
}

export interface ListTripsParams extends PaginationParams {
  status?: TripStatus;
  vehicleId?: string;
  driverId?: string;
  startDate?: string;
  endDate?: string;
}

// ---------------------------------------------------------------------------
// Maintenance Log Input Types
// ---------------------------------------------------------------------------
export interface CreateMaintenanceLogInput {
  vehicleId: string;
  description: string;
  cost: number;
  startDate: string;
  endDate?: string;
}

export interface UpdateMaintenanceLogInput {
  description?: string;
  cost?: number;
  startDate?: string;
  endDate?: string;
}

export interface ListMaintenanceLogsParams extends PaginationParams {
  vehicleId?: string;
  status?: MaintenanceStatus;
  dateFrom?: string;
  dateTo?: string;
}

// ---------------------------------------------------------------------------
// Fuel Log Input Types
// ---------------------------------------------------------------------------
export interface CreateFuelLogInput {
  vehicleId: string;
  tripId?: string;
  liters: number;
  cost: number;
  date: string;
}

export interface UpdateFuelLogInput {
  liters?: number;
  cost?: number;
  date?: string;
}

export interface ListFuelLogsParams extends PaginationParams {
  vehicleId?: string;
  tripId?: string;
  startDate?: string;
  endDate?: string;
}

// ---------------------------------------------------------------------------
// Expense Input Types
// ---------------------------------------------------------------------------
export interface CreateExpenseInput {
  vehicleId: string;
  tripId?: string;
  type: ExpenseType;
  amount: number;
  date: string;
  description?: string;
}

export interface UpdateExpenseInput {
  type?: ExpenseType;
  amount?: number;
  date?: string;
  description?: string;
}

export interface ListExpensesParams extends PaginationParams {
  vehicleId?: string;
  type?: ExpenseType;
  startDate?: string;
  endDate?: string;
}
