import { ExpenseType } from "@prisma/client";
import { VehicleModel } from "./vehicle.types";

export type ExpenseModel = {
  id: string;
  vehicleId: string;
  type: ExpenseType;
  amount: number;
  date: Date;
  description: string | null;
  createdAt: Date;
  vehicle?: VehicleModel;
};
