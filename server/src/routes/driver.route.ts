import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import { requirePermission } from "../middlewares/rbac.middleware";
import { Permission } from "../enums/permission.enum";
import {
  createDriverHandler,
  getDriverByIdHandler,
  getAllDriversHandler,
  updateDriverHandler,
  deleteDriverHandler,
} from "../controllers/driver.controller";

const router = Router();

router.post(
  "/create",
  verifyJWT,
  requirePermission(Permission.DRIVER_CREATE),
  createDriverHandler,
);
router.get(
  "/",
  verifyJWT,
  requirePermission(Permission.DRIVER_READ),
  getAllDriversHandler,
);
router.get(
  "/:id",
  verifyJWT,
  requirePermission(Permission.DRIVER_READ),
  getDriverByIdHandler,
);
router.patch(
  "/update/:id",
  verifyJWT,
  requirePermission(Permission.DRIVER_UPDATE),
  updateDriverHandler,
);
router.delete(
  "/delete/:id",
  verifyJWT,
  requirePermission(Permission.DRIVER_DELETE),
  deleteDriverHandler,
);

export default router;
