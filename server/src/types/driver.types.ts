import { DriverStatus } from "../enums/driverStatus.enum";

export type DriverModel = {
  id: string;
  userId: string;
  licenseNumber: string;
  licenseCategory: string;
  licenseExpiryDate: Date;
  safetyScore: number;
  status: DriverStatus;
  createdAt: Date;
  updatedAt: Date;
};
