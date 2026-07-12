import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import { requirePermission } from "../middlewares/rbac.middleware";
import { Permission } from "../enums/permission.enum";
import {
  createFuelLogHandler,
  updateFuelLogHandler,
  deleteFuelLogHandler,
  getFuelLogHandler,
  listFuelLogsHandler,
  getVehicleFuelStatsHandler,
} from "../controllers/fuelLog.controller";

const router = Router();

router.post(
  "/create",
  verifyJWT,
  requirePermission(Permission.FUEL_LOG_CREATE),
  createFuelLogHandler,
);

router.patch(
  "/update/:id",
  verifyJWT,
  requirePermission(Permission.FUEL_LOG_UPDATE),
  updateFuelLogHandler,
);

router.delete(
  "/delete/:id",
  verifyJWT,
  requirePermission(Permission.FUEL_LOG_DELETE),
  deleteFuelLogHandler,
);

router.get(
  "/list",
  verifyJWT,
  requirePermission(Permission.FUEL_LOG_READ),
  listFuelLogsHandler,
);

router.get(
  "/stats/:vehicleId",
  verifyJWT,
  requirePermission(Permission.FUEL_LOG_READ),
  getVehicleFuelStatsHandler,
);

router.get(
  "/:id",
  verifyJWT,
  requirePermission(Permission.FUEL_LOG_READ),
  getFuelLogHandler,
);

export default router;
