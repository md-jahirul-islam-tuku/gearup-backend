import { Router } from "express";

import { AuthControllers } from "./auth.controller";
import { loginValidationSchema, registerValidationSchema } from "./auth.validation";
import validateRequest from "../../middlewares/validateRequest";

const router = Router();

router.post(
  "/register",
  validateRequest(registerValidationSchema),
  AuthControllers.registerUser,
);

router.post(
  "/login",
  validateRequest(loginValidationSchema),
  AuthControllers.loginUser
);

export const AuthRoutes = router;
