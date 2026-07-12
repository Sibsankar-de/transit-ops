import { ExpenseModel } from "../types/expense.types";
import { toSafeVehicle } from "./vehicle.dto";

export function toSafeExpense(expense: any): ExpenseModel {
  return {
    id: expense.id,
    vehicleId: expense.vehicleId,
    type: expense.type,
    amount: Number(expense.amount),
    date: expense.date,
    description: expense.description,
    createdAt: expense.createdAt,
    vehicle: expense.vehicle ? toSafeVehicle(expense.vehicle) : undefined,
  };
}
