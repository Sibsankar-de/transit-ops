import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import { requirePermission } from "../middlewares/rbac.middleware";
import { Permission } from "../enums/permission.enum";
import {
  createVehicleHandler,
  getAllVehiclesHandler,
  updateVehicleHandler,
  deleteVehicleHandler,
} from "../controllers/vehicle.controller";

const router = Router();

router.get(
  "/",
  verifyJWT,
  requirePermission(Permission.VEHICLE_READ),
  getAllVehiclesHandler,
);
router.post(
  "/create",
  verifyJWT,
  requirePermission(Permission.VEHICLE_CREATE),
  createVehicleHandler,
);
router.patch(
  "/update/:id",
  verifyJWT,
  requirePermission(Permission.VEHICLE_UPDATE),
  updateVehicleHandler,
);
router.delete(
  "/delete/:id",
  verifyJWT,
  requirePermission(Permission.VEHICLE_DELETE),
  deleteVehicleHandler,
);

export default router;
