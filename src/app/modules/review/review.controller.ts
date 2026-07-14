import httpStatus from "http-status";
import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { ReviewServices } from "./review.service";

const createReview = catchAsync(async (req: Request, res: Response) => {
  const result = await ReviewServices.createReview(req.body, req.user!.userId);

  sendResponse(res, httpStatus.CREATED, {
    success: true,
    message: "Review submitted successfully",
    data: result,
  });
});

const getGearReviews = catchAsync(async (req: Request, res: Response) => {
  const result = await ReviewServices.getGearReviews(
    req.params.gearId as string,
  );

  sendResponse(res, httpStatus.OK, {
    success: true,
    message: "Gear reviews retrieved successfully",
    data: result,
  });
});

export const ReviewControllers = {
  createReview,
  getGearReviews,
};
