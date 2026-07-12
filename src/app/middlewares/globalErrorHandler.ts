import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { ZodError } from "zod";

import AppError from "../errors/AppError";

const globalErrorHandler = (
  error: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  let statusCode: number = 500;
  let message = "Something went wrong";
  let errorDetails: unknown = null;

  // AppError
  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
  }

  // Zod Error
  else if (error instanceof ZodError) {
    statusCode = httpStatus.BAD_REQUEST;
    message = "Validation Error";

    errorDetails = error.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
    }));
  }

  // Generic Error
  else if (error instanceof Error) {
    message = error.message;
  }

  res.status(statusCode).json({
    success: false,
    message,
    errorDetails,
  });
};

export default globalErrorHandler;
