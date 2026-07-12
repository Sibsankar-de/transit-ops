import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import {
  createUserHandler,
  loginHandler,
  logoutHandler,
  updateUserHandler,
  updatePasswordHandler,
} from "../controllers/user.controller";

const router = Router();

router.post("/create-user", createUserHandler);
router.post("/login", loginHandler);
router.post("/logout", verifyJWT, logoutHandler);
router.patch("/update", verifyJWT, updateUserHandler);
router.patch("/update-password", verifyJWT, updatePasswordHandler);

export default router;
