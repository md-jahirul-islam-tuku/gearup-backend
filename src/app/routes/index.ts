import { Router } from "express";
import { AuthRoutes } from "../modules/auth/auth.route";
import { CategoryRoutes } from "../modules/category/category.route";
import { GearRoutes } from "../modules/gear/gear.route";

const router = Router();

router.use("/auth", AuthRoutes);
router.use("/categories", CategoryRoutes);
router.use("/gears", GearRoutes);

export default router;
