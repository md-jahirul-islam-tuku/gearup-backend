import { Router } from "express";
import auth from "../../middlewares/auth";
import { Role } from "../../../../generated/prisma/enums";
import { PaymentControllers } from "./payment.controller";
import validateRequest from "../../middlewares/validateRequest";
import { createCheckoutSessionValidationSchema } from "./payment.validation";

const router = Router();

router.post(
  "/create-checkout-session",
  auth(Role.CUSTOMER),
  validateRequest(createCheckoutSessionValidationSchema),
  PaymentControllers.createCheckoutSession,
);

router.get(
  "/my-payments",
  auth(Role.CUSTOMER),
  PaymentControllers.getMyPayments,
);

router.get(
  "/:id",
  auth(Role.ADMIN, Role.CUSTOMER, Role.PROVIDER),
  PaymentControllers.getSinglePayment,
);

export const PaymentRoutes = router;
