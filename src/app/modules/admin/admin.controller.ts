import httpStatus from "http-status";
import { Request, Response } from "express";
import sendResponse from "../../utils/sendResponse";
import { AdminServices } from "./admin.service";
import { catchAsync } from "../../utils/catchAsync";

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminServices.getAllUsers(req.query);

  sendResponse(res, httpStatus.OK, {
    success: true,
    message: "Users retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

export const AdminControllers = {
  getAllUsers,
};
