import { Router } from "express";
import {
  createMaintenanceLogHandler,
  closeMaintenanceLogHandler,
  updateMaintenanceLogHandler,
  getMaintenanceLogHandler,
  listMaintenanceLogsHandler,
  getVehicleMaintenanceCostHandler,
} from "../controllers/maintenance.controller";

const router = Router();

router.get("/vehicles/:vehicleId/cost", getVehicleMaintenanceCostHandler);

router.post("/", createMaintenanceLogHandler);
router.get("/", listMaintenanceLogsHandler);

router.get("/:id", getMaintenanceLogHandler);
router.patch("/:id", updateMaintenanceLogHandler);
router.patch("/:id/close", closeMaintenanceLogHandler);

export default router;
