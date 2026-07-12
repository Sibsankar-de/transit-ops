import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import { requirePermission } from "../middlewares/rbac.middleware";
import { Permission } from "../enums/permission.enum";
import {
  createExpenseHandler,
  updateExpenseHandler,
  deleteExpenseHandler,
  getExpenseHandler,
  listExpensesHandler,
  getVehicleExpenseTotalHandler,
  getVehicleOperationalCostHandler,
} from "../controllers/expense.controller";

const router = Router();

router.post(
  "/create",
  verifyJWT,
  requirePermission(Permission.EXPENSE_CREATE),
  createExpenseHandler,
);

router.patch(
  "/update/:id",
  verifyJWT,
  requirePermission(Permission.EXPENSE_UPDATE),
  updateExpenseHandler,
);

router.delete(
  "/delete/:id",
  verifyJWT,
  requirePermission(Permission.EXPENSE_DELETE),
  deleteExpenseHandler,
);

router.get(
  "/list",
  verifyJWT,
  requirePermission(Permission.EXPENSE_READ),
  listExpensesHandler,
);

router.get(
  "/total/:vehicleId",
  verifyJWT,
  requirePermission(Permission.EXPENSE_READ),
  getVehicleExpenseTotalHandler,
);

router.get(
  "/operational-cost/:vehicleId",
  verifyJWT,
  requirePermission(Permission.REPORT_VIEW),
  getVehicleOperationalCostHandler,
);

router.get(
  "/:id",
  verifyJWT,
  requirePermission(Permission.EXPENSE_READ),
  getExpenseHandler,
);

export default router;
