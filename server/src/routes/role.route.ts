import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import {
  createRoleHandler,
  getRolesHandler,
  getRoleByIdHandler,
  updateRoleHandler,
  deleteRoleHandler,
} from "../controllers/role.controller";

const router = Router();

router.post("/", verifyJWT, createRoleHandler);
router.get("/", verifyJWT, getRolesHandler);
router.get("/:id", verifyJWT, getRoleByIdHandler);
router.patch("/:id", verifyJWT, updateRoleHandler);
router.delete("/:id", verifyJWT, deleteRoleHandler);

export default router;
