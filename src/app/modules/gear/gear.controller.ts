import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { Request, Response } from "express";
import { GearServices } from "./gear.service";

const createGear = catchAsync(async (req: Request, res: Response) => {
  const result = await GearServices.createGear(
    req.body,
    req.user?.userId as string,
  );

  sendResponse(res, httpStatus.CREATED, {
    success: true,
    message: "Gear created successfully",
    data: result,
  });
});

export const GearControllers = {
  createGear,
};
