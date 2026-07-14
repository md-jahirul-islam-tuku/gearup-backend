import { Router } from "express";

import { AuthControllers } from "./auth.controller";
import {
  changePasswordValidationSchema,
  loginValidationSchema,
  registerValidationSchema,
  updateProfileValidationSchema,
} from "./auth.validation";
import validateRequest from "../../middlewares/validateRequest";
import auth from "../../middlewares/auth";
import { Role } from "../../../../generated/prisma/enums";

const router = Router();

router.post(
  "/register",
  validateRequest(registerValidationSchema),
  AuthControllers.registerUser,
);

router.post(
  "/login",
  validateRequest(loginValidationSchema),
  AuthControllers.loginUser,
);

router.get("/me", auth(), AuthControllers.getMe);

router.patch(
  "/me",
  auth(Role.ADMIN, Role.CUSTOMER, Role.PROVIDER),
  validateRequest(updateProfileValidationSchema),
  AuthControllers.updateMyProfile,
);

router.patch(
  "/change-password",
  auth(Role.ADMIN, Role.CUSTOMER, Role.PROVIDER),
  validateRequest(changePasswordValidationSchema),
  AuthControllers.changePassword,
);

router.post("/logout", AuthControllers.logout);

router.post("/refresh-token", AuthControllers.refreshToken);

export const AuthRoutes = router;
