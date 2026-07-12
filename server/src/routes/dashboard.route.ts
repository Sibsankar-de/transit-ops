import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import { requirePermission } from "../middlewares/rbac.middleware";
import { Permission } from "../enums/permission.enum";
import { getDashboardKPIsHandler } from "../controllers/dashboard.controller";

const router = Router();

router.get(
  "/kpis",
  verifyJWT,
  requirePermission(Permission.REPORT_VIEW),
  getDashboardKPIsHandler,
);

export default router;
