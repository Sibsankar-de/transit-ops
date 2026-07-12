import { DriverStatus } from "@/enums/driverStatus.enum";

// Status Enums
export enum UserStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  SUSPENDED = "SUSPENDED"
}

export enum VehicleStatus {
  AVAILABLE = "AVAILABLE",
  ON_TRIP = "ON TRIP",
  IN_SHOP = "IN SHOP",
  RETIRED = "RETIRED"
}

// Entity Interfaces
export interface User {
  id: string;
  name: string;
  email: string;
  status: UserStatus;
  roleId: string | null;
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
  user: User;
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

// API Envelope
export interface ApiResponse<T> {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;
}

// User / Auth Input Types
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

// Role Input Types
export interface CreateRoleInput {
  name: string;
  permissions: string[];
}

export interface UpdateRoleInput {
  name?: string;
  permissions?: string[];
}

// Driver Input Types
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

// Vehicle Input Types
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
