import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { JwtPayload } from "jsonwebtoken";
import config from "../config";
import { prisma } from "../config/prisma";
import AppError from "../errors/AppError";
import { catchAsync } from "../utils/catchAsync";
import verifyToken from "../utils/verifyToken";
import { Role, UserStatus } from "../../../generated/prisma/enums";

const auth =
  (...requiredRoles: Role[]) =>
  catchAsync(async (req: Request, _res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError(
        httpStatus.UNAUTHORIZED,
        "You are not authorized",
      );
    }

    const token = authHeader.split(" ")[1];

    const decoded = verifyToken(
      token as string,
      config.jwt_access_secret,
    ) as JwtPayload;

    const { userId, email, role } = decoded;

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new AppError(
        httpStatus.NOT_FOUND,
        "User not found",
      );
    }

    if (user.status === UserStatus.SUSPENDED) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "Your account has been suspended",
      );
    }

    if (
      requiredRoles.length > 0 &&
      !requiredRoles.includes(user.role)
    ) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "You are forbidden to access this resource",
      );
    }

    req.user = {
      userId,
      email,
      role,
    };

    next();
  });

export default auth;