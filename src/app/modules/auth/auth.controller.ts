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
  const { accessToken, refreshToken } = await AuthServices.loginUser(req.body);

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: false,
    sameSite: "none",
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 day
  });

  sendResponse(res, httpStatus.OK, {
    success: true,
    message: "User logged in successfully",
    data: {
      accessToken,
      refreshToken,
    },
  });
});

const refreshToken = catchAsync(async (req, res) => {
  const token = req.cookies.refreshToken;

  const result = await AuthServices.refreshToken(token);

  sendResponse(res, httpStatus.OK, {
    success: true,
    message: "Access token generated successfully",
    data: result,
  });
});

export const AuthControllers = {
  registerUser,
  loginUser,
  refreshToken,
};
