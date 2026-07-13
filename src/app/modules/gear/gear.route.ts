import { Router } from "express";
import auth from "../../middlewares/auth";
import { Role } from "../../../../generated/prisma/enums";
import validateRequest from "../../middlewares/validateRequest";
import {
  createGearValidationSchema,
  updateGearValidationSchema,
} from "./gear.validation";
import { GearControllers } from "./gear.controller";

const router = Router();

router.get("/", GearControllers.getAllGears);
router.get("/:id", GearControllers.getSingleGear);
router.patch(
  "/:id",
  auth(Role.ADMIN, Role.PROVIDER),
  validateRequest(updateGearValidationSchema),
  GearControllers.updateGear,
);
router.delete(
  "/:id",
  auth(Role.ADMIN, Role.PROVIDER),
  GearControllers.deleteGear,
);

router.post(
  "/",
  auth(Role.PROVIDER, Role.ADMIN),
  validateRequest(createGearValidationSchema),
  GearControllers.createGear,
);

export const GearRoutes = router;
