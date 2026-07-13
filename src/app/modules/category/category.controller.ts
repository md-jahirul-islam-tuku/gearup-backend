import httpStatus from "http-status";
import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { CategoryServices } from "./category.service";
import sendResponse from "../../utils/sendResponse";

const createCategory = catchAsync(async (req: Request, res: Response) => {
  const result = await CategoryServices.createCategory(req.body);

  sendResponse(res, httpStatus.CREATED, {
    success: true,
    message: "Category created successfully",
    data: result,
  });
});

export const CategoryControllers = {
  createCategory,
};
