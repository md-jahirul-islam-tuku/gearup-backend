import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";

const globalErrorHandler = (
  error: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const message =
    error instanceof Error ? error.message : "Something went wrong";
  const errorDetails = error instanceof Error ? error.stack : undefined;

  res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
    success: false,
    message,
    errorDetails,
  });
};

export default globalErrorHandler;
