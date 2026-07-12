import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import { requirePermission } from "../middlewares/rbac.middleware";
import { Permission } from "../enums/permission.enum";
import {
  createTripHandler,
  dispatchTripHandler,
  completeTripHandler,
  cancelTripHandler,
  getTripHandler,
  listTripsHandler,
} from "../controllers/trip.controller";

const router = Router();

router.post(
  "/",
  verifyJWT,
  requirePermission(Permission.TRIP_CREATE),
  createTripHandler,
);
router.get(
  "/",
  verifyJWT,
  requirePermission(Permission.TRIP_READ),
  listTripsHandler,
);
router.get(
  "/:id",
  verifyJWT,
  requirePermission(Permission.TRIP_READ),
  getTripHandler,
);
router.post(
  "/:id/dispatch",
  verifyJWT,
  requirePermission(Permission.TRIP_DISPATCH),
  dispatchTripHandler,
);
router.post(
  "/:id/complete",
  verifyJWT,
  requirePermission(Permission.TRIP_UPDATE),
  completeTripHandler,
);
router.post(
  "/:id/cancel",
  verifyJWT,
  requirePermission(Permission.TRIP_CANCEL),
  cancelTripHandler,
);

export default router;
