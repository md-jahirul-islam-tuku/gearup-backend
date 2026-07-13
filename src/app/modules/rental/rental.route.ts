import { Router } from "express";
import auth from "../../middlewares/auth";
import { Role } from "../../../../generated/prisma/enums";
import validateRequest from "../../middlewares/validateRequest";
import { createRentalValidationSchema } from "./rental.validation";
import { RentalControllers } from "./rental.controller";

const router = Router();

router.post(
  "/",
  auth(Role.CUSTOMER),
  validateRequest(createRentalValidationSchema),
  RentalControllers.createRental,
);

export const RentalRoutes = router;
