import { Router } from "express";
import auth from "../../middlewares/auth";
import { Role } from "../../../../generated/prisma/enums";
import validateRequest from "../../middlewares/validateRequest";
import {
  createRentalValidationSchema,
  updateRentalStatusValidationSchema,
} from "./rental.validation";
import { RentalControllers } from "./rental.controller";

const router = Router();

router.post(
  "/",
  auth(Role.CUSTOMER),
  validateRequest(createRentalValidationSchema),
  RentalControllers.createRental,
);

router.get("/my-rentals", auth(Role.CUSTOMER), RentalControllers.getMyRentals);

router.get(
  "/provider",
  auth(Role.PROVIDER),
  RentalControllers.getProviderRentals,
);

router.get(
  "/:id",
  auth(Role.CUSTOMER, Role.PROVIDER, Role.ADMIN),
  RentalControllers.getSingleRental,
);

router.patch(
  "/:id/status",
  auth(Role.PROVIDER),
  validateRequest(updateRentalStatusValidationSchema),
  RentalControllers.updateRentalStatus,
);

router.post("/:id", auth(Role.CUSTOMER), RentalControllers.cancelRental);

export const RentalRoutes = router;
