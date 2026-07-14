import { Router } from "express";
import { Role } from "../../../../generated/prisma/enums";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { ReviewControllers } from "./review.controller";
import { createReviewValidationSchema } from "./review.validation";

const router = Router();

router.post(
  "/",
  auth(Role.CUSTOMER),
  validateRequest(createReviewValidationSchema),
  ReviewControllers.createReview,
);

router.get("/gear/:gearId", ReviewControllers.getGearReviews);

export const ReviewRoutes = router;
