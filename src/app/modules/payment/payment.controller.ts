import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { PaymentServices } from "./payment.service";
import { Request, Response } from "express";

const createCheckoutSession = catchAsync(async (req, res) => {
  const result = await PaymentServices.createCheckoutSession(
    req.body.rentalId,
    req.user!,
  );

  sendResponse(res, httpStatus.OK, {
    success: true,
    message: "Checkout session created successfully",
    data: result,
  });
});

const stripeWebhook = async (req: Request, res: Response) => {
  await PaymentServices.stripeWebhook(
    req.body,
    req.headers["stripe-signature"] as string,
  );

  res.status(200).json({
    received: true,
  });
};

export const PaymentControllers = {
  createCheckoutSession,
  stripeWebhook,
};
