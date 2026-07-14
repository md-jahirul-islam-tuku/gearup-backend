import { Router } from "express";
import { AuthRoutes } from "../modules/auth/auth.route";
import { CategoryRoutes } from "../modules/category/category.route";
import { GearRoutes } from "../modules/gear/gear.route";
import { RentalRoutes } from "../modules/rental/rental.route";
import { PaymentRoutes } from "../modules/payment/payment.route";
import { ReviewRoutes } from "../modules/review/review.route";

const router = Router();

router.use("/auth", AuthRoutes);
router.use("/categories", CategoryRoutes);
router.use("/gears", GearRoutes);
router.use("/rentals", RentalRoutes);
router.use("/payments", PaymentRoutes);
router.use("/reviews", ReviewRoutes);

export default router;
