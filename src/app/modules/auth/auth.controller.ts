import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { AuthServices } from "./auth.service";
import sendResponse from "../../utils/sendResponse";
import { Request, Response } from "express";

const registerUser = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthServices.registerUser(req.body);

  sendResponse(res, httpStatus.CREATED, {
    success: true,
    message: "User registered successfully",
    data: result,
  });
});

export const AuthControllers = {
  registerUser,
};
