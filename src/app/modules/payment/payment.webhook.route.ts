import express from "express";
import { PaymentControllers } from "./payment.controller";

const router = express.Router();

router.post("/", PaymentControllers.stripeWebhook);

export default router;
