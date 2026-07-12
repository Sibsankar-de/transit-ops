import { Router } from "express";
import {
  createVehicleHandler,
  updateVehicleHandler,
  deleteVehicleHandler,
} from "../controllers/vehicle.controller";

const router = Router();

router.post("/create", createVehicleHandler);
router.patch("/update/:id", updateVehicleHandler);
router.delete("/delete/:id", deleteVehicleHandler);

export default router;
