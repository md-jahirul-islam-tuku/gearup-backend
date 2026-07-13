import { Router } from "express";
import auth from "../../middlewares/auth";
import { Role } from "../../../../generated/prisma/enums";
import validateRequest from "../../middlewares/validateRequest";
import { CategoryControllers } from "./category.controller";
import { createCategoryValidationSchema } from "./category.validation";

const router = Router();

router.post(
  "/",
  auth(Role.ADMIN),
  validateRequest(createCategoryValidationSchema),
  CategoryControllers.createCategory,
);

router.get("/", CategoryControllers.getAllCategories);

export const CategoryRoutes = router;
