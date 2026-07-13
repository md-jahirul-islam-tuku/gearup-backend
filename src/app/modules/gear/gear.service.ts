import httpStatus from "http-status";

import { prisma } from "../../config/prisma";
import AppError from "../../errors/AppError";

import { TCreateGear } from "./gear.interface";
import { UserStatus } from "../../../../generated/prisma/enums";

const createGear = async (payload: TCreateGear, providerId: string) => {
  // Provider exists?
  const provider = await prisma.user.findUnique({
    where: {
      id: providerId,
    },
  });

  if (!provider) {
    throw new AppError(httpStatus.NOT_FOUND, "Provider not found");
  }

  if (provider.status === UserStatus.SUSPENDED) {
    throw new AppError(httpStatus.FORBIDDEN, "Provider account is suspended");
  }

  // Category exists?
  const category = await prisma.category.findUnique({
    where: {
      id: payload.categoryId,
    },
  });

  if (!category) {
    throw new AppError(httpStatus.NOT_FOUND, "Category not found");
  }

  const gear = await prisma.gearItem.create({
    data: {
      ...payload,
      providerId,
      isAvailable: payload.stock > 0,
    },
  });

  return gear;
};

export const GearServices = {
  createGear,
};
