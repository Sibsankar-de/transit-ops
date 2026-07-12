import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import { requirePermission } from "../middlewares/rbac.middleware";
import { Permission } from "../enums/permission.enum";
import {
  createRoleHandler,
  getRolesHandler,
  getRoleByIdHandler,
  updateRoleHandler,
  deleteRoleHandler,
} from "../controllers/role.controller";

const router = Router();

router.post(
  "/",
  verifyJWT,
  requirePermission(Permission.ROLE_CREATE),
  createRoleHandler,
);
router.get(
  "/",
  verifyJWT,
  requirePermission(Permission.ROLE_READ),
  getRolesHandler,
);
router.get(
  "/:id",
  verifyJWT,
  requirePermission(Permission.ROLE_READ),
  getRoleByIdHandler,
);
router.patch(
  "/:id",
  verifyJWT,
  requirePermission(Permission.ROLE_UPDATE),
  updateRoleHandler,
);
router.delete(
  "/:id",
  verifyJWT,
  requirePermission(Permission.ROLE_DELETE),
  deleteRoleHandler,
);

export default router;
