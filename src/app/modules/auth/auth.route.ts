import { Router } from "express";

import { AuthControllers } from "./auth.controller";
import {
  loginValidationSchema,
  registerValidationSchema,
} from "./auth.validation";
import validateRequest from "../../middlewares/validateRequest";
import auth from "../../middlewares/auth";

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

router.post("/logout", AuthControllers.logout);

router.post("/refresh-token", AuthControllers.refreshToken);

export const AuthRoutes = router;
