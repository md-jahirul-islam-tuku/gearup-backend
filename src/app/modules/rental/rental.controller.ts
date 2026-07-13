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

export const RentalControllers = {
  createRental,
};
