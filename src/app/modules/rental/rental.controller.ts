import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { RentalServices } from "./rental.service";
import sendResponse from "../../utils/sendResponse";

const createRental = catchAsync(async (req, res) => {
  const result = await RentalServices.createRental(
    req.body,
    req.user?.userId as string,
  );

  sendResponse(res, httpStatus.CREATED, {
    success: true,
    message: "Rental order created successfully",
    data: result,
  });
});

const getMyRentals = catchAsync(async (req, res) => {
  const result = await RentalServices.getMyRentals(req.user!.userId, req.query);

  sendResponse(res, httpStatus.OK, {
    success: true,
    message: "Rental orders retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

export const RentalControllers = {
  createRental,
  getMyRentals,
};
