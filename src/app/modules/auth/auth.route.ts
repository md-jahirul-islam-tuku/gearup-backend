import { Router } from "express";

import { AuthControllers } from "./auth.controller";
import { registerValidationSchema } from "./auth.validation";
import validateRequest from "../../middlewares/validateRequest";

const router = Router();

router.post(
  "/register",
  validateRequest(registerValidationSchema),
  AuthControllers.registerUser,
);

export const AuthRoutes = router;
