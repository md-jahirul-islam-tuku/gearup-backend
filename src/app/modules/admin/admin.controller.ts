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

const updateUserStatus = catchAsync(async (req, res) => {
  const result = await AdminServices.updateUserStatus(
    req.params.id as string,
    req.body,
    req.user!.userId,
  );

  sendResponse(res, httpStatus.OK, {
    success: true,
    message: "User status updated successfully",
    data: result,
  });
});

const getAllGear = catchAsync(async (req, res) => {
  const result = await AdminServices.getAllGear(req.query);

  sendResponse(res, httpStatus.OK, {
    success: true,
    message: "Gear retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getAllRentals = catchAsync(async (req, res) => {
  const result = await AdminServices.getAllRentals(req.query);

  sendResponse(res, httpStatus.OK, {
    success: true,
    message: "Rental orders retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

export const AdminControllers = {
  getAllUsers,
  updateUserStatus,
  getAllGear,
  getAllRentals,
};
