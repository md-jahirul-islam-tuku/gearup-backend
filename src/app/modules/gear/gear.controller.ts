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

const getAllGears = catchAsync(async (req, res) => {
  const result = await GearServices.getAllGears(req.query);

  sendResponse(res, httpStatus.OK, {
    success: true,
    message: "Gears retrieved successfully",
    data: result,
  });
});

const getSingleGear = catchAsync(async (req, res) => {
  const result = await GearServices.getSingleGear(req.params.id as string);

  sendResponse(res, httpStatus.OK, {
    success: true,
    message: "Gear retrieved successfully",
    data: result,
  });
});

const updateGear = catchAsync(async (req, res) => {
  const result = await GearServices.updateGear(
    req.params.id as string,
    req.body,
    req.user!,
  );

  sendResponse(res, httpStatus.OK, {
    success: true,
    message: "Gear updated successfully",
    data: result,
  });
});

const deleteGear = catchAsync(async (req, res) => {
  await GearServices.deleteGear(req.params.id as string, req.user!);

  sendResponse(res, httpStatus.OK, {
    success: true,
    message: "Gear deleted successfully",
    data: null,
  });
});

export const GearControllers = {
  createGear,
  getAllGears,
  getSingleGear,
  updateGear,
  deleteGear,
};
