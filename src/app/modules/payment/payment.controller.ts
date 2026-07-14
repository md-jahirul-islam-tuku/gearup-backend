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

const getMyPayments = catchAsync(async (req, res) => {
  const result = await PaymentServices.getMyPayments(
    req.user!.userId,
    req.query,
  );

  sendResponse(res, httpStatus.OK, {
    success: true,
    message: "Payment history retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getSinglePayment = catchAsync(async (req, res) => {
  const result = await PaymentServices.getSinglePayment(
    req.params.id as string,
    req.user!,
  );

  sendResponse(res, httpStatus.OK, {
    success: true,
    message: "Payment retrieved successfully",
    data: result,
  });
});

export const PaymentControllers = {
  createCheckoutSession,
  stripeWebhook,
  getMyPayments,
  getSinglePayment,
};
