import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { AuthServices } from "./auth.service";
import sendResponse from "../../utils/sendResponse";
import { Request, Response } from "express";
import config from "../../config";

const cookieOptions = {
  httpOnly: true,
  secure: config.node_env === "production",
  sameSite:
    config.node_env === "production" ? ("none" as const) : ("lax" as const),
};

const registerUser = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthServices.registerUser(req.body);

  sendResponse(res, httpStatus.CREATED, {
    success: true,
    message: "User registered successfully",
    data: result,
  });
});

const loginUser = catchAsync(async (req, res) => {
  const { accessToken, refreshToken, user } = await AuthServices.loginUser(
    req.body,
  );

  res.cookie("refreshToken", refreshToken, cookieOptions);

  sendResponse(res, httpStatus.OK, {
    success: true,
    message: "User logged in successfully",
    data: {
      accessToken,
      refreshToken,
      user,
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

const logout = catchAsync(async (_req: Request, res: Response) => {
  res.clearCookie("refreshToken", cookieOptions);

  sendResponse(res, httpStatus.OK, {
    success: true,
    message: "Logged out successfully",
    data: null,
  });
});

export const AuthControllers = {
  registerUser,
  loginUser,
  refreshToken,
  logout,
};
