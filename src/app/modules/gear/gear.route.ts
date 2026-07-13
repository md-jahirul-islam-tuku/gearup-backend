import { Router } from "express";
import auth from "../../middlewares/auth";
import { Role } from "../../../../generated/prisma/enums";
import validateRequest from "../../middlewares/validateRequest";
import { createGearValidationSchema } from "./gear.validation";
import { GearControllers } from "./gear.controller";

const router = Router();

router.post(
  "/",
  auth(Role.PROVIDER, Role.ADMIN),
  validateRequest(createGearValidationSchema),
  GearControllers.createGear,
);

export const GearRoutes = router;
