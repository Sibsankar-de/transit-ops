import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import { requirePermission } from "../middlewares/rbac.middleware";
import { Permission } from "../enums/permission.enum";
import {
  getFuelEfficiencyReportHandler,
  getFleetUtilizationReportHandler,
  getOperationalCostReportHandler,
  getVehicleROIReportHandler,
  exportReportCSVHandler,
} from "../controllers/reports.controller";

const router = Router();

router.get(
  "/fuel-efficiency",
  verifyJWT,
  requirePermission(Permission.REPORT_VIEW),
  getFuelEfficiencyReportHandler,
);

router.get(
  "/fleet-utilization",
  verifyJWT,
  requirePermission(Permission.REPORT_VIEW),
  getFleetUtilizationReportHandler,
);

router.get(
  "/operational-cost",
  verifyJWT,
  requirePermission(Permission.REPORT_VIEW),
  getOperationalCostReportHandler,
);

router.get(
  "/roi",
  verifyJWT,
  requirePermission(Permission.REPORT_VIEW),
  getVehicleROIReportHandler,
);

router.get(
  "/export",
  verifyJWT,
  requirePermission(Permission.REPORT_EXPORT),
  exportReportCSVHandler,
);

export default router;
