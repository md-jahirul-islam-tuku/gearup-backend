import { Response } from "express";
import { TApiResponse } from "../interfaces/apiResponse";

const sendResponse = <T>(
  res: Response,
  statusCode: number,
  payload: TApiResponse<T>,
) => {
  res.status(statusCode).json(payload);
};

export default sendResponse;
