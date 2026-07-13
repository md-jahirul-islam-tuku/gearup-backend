import httpStatus from "http-status";

import { prisma } from "../../config/prisma";
import AppError from "../../errors/AppError";

import { TCreateGear } from "./gear.interface";
import { UserStatus } from "../../../../generated/prisma/enums";
import { calculatePagination } from "../../utils/pagination";
import { Prisma } from "../../../../generated/prisma/client";

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

const getAllGears = async (query: Record<string, unknown>) => {
  const searchTerm = query.searchTerm as string | undefined;

  const categoryId = query.categoryId as string | undefined;

  const minPrice = query.minPrice ? Number(query.minPrice) : undefined;

  const maxPrice = query.maxPrice ? Number(query.maxPrice) : undefined;

  const isAvailable = query.isAvailable as string | undefined;

  const sortableFields = ["pricePerDay", "createdAt", "stock"] as const;

  const sortBy = query.sortBy as string | undefined;
  const sortOrder = query.sortOrder === "asc" ? "asc" : "desc";

  const andConditions: Prisma.GearItemWhereInput[] = [];

  // Pagination
  const { page, limit, skip } = calculatePagination(query);

  // Searching
  if (searchTerm) {
    andConditions.push({
      OR: [
        {
          name: {
            contains: searchTerm,
            mode: "insensitive",
          },
        },
        {
          brand: {
            contains: searchTerm,
            mode: "insensitive",
          },
        },
      ],
    });
  }

  // Category Filter
  if (categoryId) {
    andConditions.push({
      categoryId,
    });
  }

  // Price Range Filter
  if (minPrice !== undefined || maxPrice !== undefined) {
    andConditions.push({
      pricePerDay: {
        ...(minPrice !== undefined && {
          gte: minPrice,
        }),
        ...(maxPrice !== undefined && {
          lte: maxPrice,
        }),
      },
    });
  }

  // Availability Filter
  if (isAvailable === "true") {
    andConditions.push({
      isAvailable: true,
    });
  }

  if (isAvailable === "false") {
    andConditions.push({
      isAvailable: false,
    });
  }

  // Sorting
  let orderBy: Prisma.GearItemOrderByWithRelationInput = {
    createdAt: "desc",
  };

  if (
    sortBy &&
    sortableFields.includes(sortBy as (typeof sortableFields)[number])
  ) {
    orderBy = {
      [sortBy]: sortOrder,
    };
  }

  const whereConditions: Prisma.GearItemWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const gears = await prisma.gearItem.findMany({
    where: whereConditions,

    skip,
    take: limit,

    include: {
      category: true,
      provider: {
        omit: {
          password: true,
        },
      },
    },

    orderBy,
  });

  const total = await prisma.gearItem.count({
    where: whereConditions,
  });

  return {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },

    data: gears,
  };
};

export const GearServices = {
  createGear,
  getAllGears,
};
