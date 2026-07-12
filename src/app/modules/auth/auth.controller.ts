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

const loginUser = catchAsync(async (req, res) => {
  const result = await AuthServices.loginUser(req.body);

  sendResponse(res, httpStatus.OK, {
    success: true,
    message: "User logged in successfully",
    data: result,
  });
});

export const AuthControllers = {
  registerUser,
  loginUser,
};
