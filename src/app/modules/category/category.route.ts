import { Router } from "express";
import auth from "../../middlewares/auth";
import { Role } from "../../../../generated/prisma/enums";
import validateRequest from "../../middlewares/validateRequest";
import { CategoryControllers } from "./category.controller";
import {
  createCategoryValidationSchema,
  updateCategoryValidationSchema,
} from "./category.validation";

const router = Router();

router.get("/", CategoryControllers.getAllCategories);

router.get("/:id", CategoryControllers.getSingleCategory);

router.patch(
  "/:id",
  auth(Role.ADMIN),
  validateRequest(updateCategoryValidationSchema),
  CategoryControllers.updateCategory,
);

router.post(
  "/",
  auth(Role.ADMIN),
  validateRequest(createCategoryValidationSchema),
  CategoryControllers.createCategory,
);

export const CategoryRoutes = router;
