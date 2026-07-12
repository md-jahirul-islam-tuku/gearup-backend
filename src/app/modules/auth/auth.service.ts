import bcrypt from "bcrypt";
import httpStatus from "http-status";
import { prisma } from "../../config/prisma";
import AppError from "../../errors/AppError";
import { TLoginUser, TRegisterUser } from "./auth.interface";
import config from "../../config";
import createToken from "../../utils/createToken";
import { SignOptions } from "jsonwebtoken";

const registerUser = async (payload: TRegisterUser) => {
  const isUserExists = await prisma.user.findUnique({
    where: {
      email: payload.email,
    },
  });

  if (isUserExists) {
    throw new AppError(
      httpStatus.CONFLICT,
      "User already exists with this email",
    );
  }

  const hashedPassword = await bcrypt.hash(
    payload.password,
    Number(config.bcrypt_salt_rounds),
  );

  const user = await prisma.user.create({
    data: {
      ...payload,
      password: hashedPassword,
    },
    omit: {
      password: true,
    },
  });

  return user;
};

const loginUser = async (payload: TLoginUser) => {
  const user = await prisma.user.findUnique({
    where: {
      email: payload.email,
    },
  });

  if (!user) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid email or password");
  }

  if (user.status === "SUSPENDED") {
    throw new AppError(httpStatus.FORBIDDEN, "Your account has been suspended");
  }

  const isPasswordMatched = await bcrypt.compare(
    payload.password,
    user.password,
  );

  if (!isPasswordMatched) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid email or password");
  }

  const jwtPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret,
    config.jwt_access_expires_in as SignOptions,
  );

  const loggedInUser = await prisma.user.findUnique({
    where: {
      id: user.id,
    },
    omit: {
      password: true,
    },
  });

  return {
    accessToken,
    user: loggedInUser,
  };
};

export const AuthServices = {
  registerUser,
  loginUser,
};
