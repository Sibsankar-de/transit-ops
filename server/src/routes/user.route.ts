import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import { requirePermission } from "../middlewares/rbac.middleware";
import { Permission } from "../enums/permission.enum";
import {
  createUserHandler,
  loginHandler,
  logoutHandler,
  updateUserHandler,
  updatePasswordHandler,
} from "../controllers/user.controller";

const router = Router();

router.post(
  "/create-user",
  verifyJWT,
  requirePermission(Permission.USER_CREATE),
  createUserHandler,
);
router.post("/login", loginHandler);
router.post("/logout", verifyJWT, logoutHandler);
router.patch(
  "/update",
  verifyJWT,
  requirePermission(Permission.USER_UPDATE),
  updateUserHandler,
);
router.patch(
  "/update-password",
  verifyJWT,
  requirePermission(Permission.USER_UPDATE),
  updatePasswordHandler,
);

export default router;
