import { Router } from "express";
import {
  createDriverHandler,
  getDriverByIdHandler,
  getAllDriversHandler,
  updateDriverHandler,
  deleteDriverHandler,
} from "../controllers/driver.controller";

const router = Router();

router.post("/create", createDriverHandler);
router.get("/", getAllDriversHandler);
router.get("/:id", getDriverByIdHandler);
router.patch("/update/:id", updateDriverHandler);
router.delete("/delete/:id", deleteDriverHandler);

export default router;
