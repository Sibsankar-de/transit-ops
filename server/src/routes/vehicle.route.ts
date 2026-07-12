import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import { requirePermission } from "../middlewares/rbac.middleware";
import { Permission } from "../enums/permission.enum";
import {
  createVehicleHandler,
  updateVehicleHandler,
  deleteVehicleHandler,
} from "../controllers/vehicle.controller";

const router = Router();

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
