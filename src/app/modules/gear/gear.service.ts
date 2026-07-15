import httpStatus from "http-status";

import { prisma } from "../../config/prisma";
import AppError from "../../errors/AppError";

import { TCreateGear, TUpdateGear } from "./gear.interface";
import { Role, UserStatus } from "../../../../generated/prisma/enums";
import { calculatePagination } from "../../utils/pagination";
import { Prisma } from "../../../../generated/prisma/client";
import { TCurrentUser } from "../../types/current-user";

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
  const brand = query.brand as string | undefined;

  const minPrice = query.minPrice ? Number(query.minPrice) : undefined;

  const maxPrice = query.maxPrice ? Number(query.maxPrice) : undefined;

  const isAvailable = query.isAvailable as string | undefined;

  const sortableFields = ["pricePerDay", "createdAt", "stock"] as const;

  const sortBy = query.sortBy as string | undefined;

  const sortOrder = query.sortOrder === "asc" ? "asc" : "desc";

  // Pagination
  const { page, limit, skip } = calculatePagination(query);

  const andConditions: Prisma.GearItemWhereInput[] = [];

  /**
   * Default Behavior
   * ----------------
   * GET /api/gears
   * => Only Available Gear
   *
   * GET /api/gears?isAvailable=true
   * => Only Available Gear
   *
   * GET /api/gears?isAvailable=false
   * => Only Unavailable Gear
   */
  if (isAvailable === "true") {
    andConditions.push({
      isAvailable: true,
    });
  } else if (isAvailable === "false") {
    andConditions.push({
      isAvailable: false,
    });
  } else {
    // Default
    andConditions.push({
      isAvailable: true,
    });
  }

  /**
   * Search
   * Search by:
   * - Gear Name
   * - Brand
   * - Category Name
   */
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
        {
          category: {
            name: {
              contains: searchTerm,
              mode: "insensitive",
            },
          },
        },
      ],
    });
  }

  // Brand Filter
  if (brand) {
    andConditions.push({
      brand: {
        contains: brand,
        mode: "insensitive",
      },
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

  const whereConditions: Prisma.GearItemWhereInput = andConditions.length
    ? {
        AND: andConditions,
      }
    : {};

  const gears = await prisma.gearItem.findMany({
    where: whereConditions,

    include: {
      category: true,
      provider: {
        omit: {
          password: true,
        },
      },
    },

    orderBy,

    skip,
    take: limit,
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

const getSingleGear = async (id: string) => {
  const gear = await prisma.gearItem.findUnique({
    where: {
      id,
    },

    include: {
      category: true,

      provider: {
        omit: {
          password: true,
        },
      },

      reviews: {
        include: {
          customer: {
            omit: {
              password: true,
            },
          },
        },

        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!gear) {
    throw new AppError(httpStatus.NOT_FOUND, "Gear not found");
  }

  return gear;
};

const updateGear = async (
  id: string,
  payload: TUpdateGear,
  currentUser: TCurrentUser,
) => {
  const gear = await prisma.gearItem.findUnique({
    where: {
      id,
    },
  });

  if (!gear) {
    throw new AppError(httpStatus.NOT_FOUND, "Gear not found");
  }

  // Authorization
  if (
    currentUser.role !== Role.ADMIN &&
    gear.providerId !== currentUser.userId
  ) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not authorized to update this gear",
    );
  }

  // Category Validation
  if (payload.categoryId) {
    const category = await prisma.category.findUnique({
      where: {
        id: payload.categoryId,
      },
    });

    if (!category) {
      throw new AppError(httpStatus.NOT_FOUND, "Category not found");
    }
  }

  const updateData: TUpdateGear & {
    isAvailable?: boolean;
  } = {
    ...payload,
  };

  // Auto update availability
  if (payload.stock !== undefined) {
    updateData.isAvailable = payload.stock > 0;
  }

  const updatedGear = await prisma.gearItem.update({
    where: {
      id,
    },
    data: updateData,
    include: {
      category: true,
      provider: {
        omit: {
          password: true,
        },
      },
    },
  });

  return updatedGear;
};

const deleteGear = async (id: string, currentUser: TCurrentUser) => {
  const gear = await prisma.gearItem.findUnique({
    where: {
      id,
    },
  });

  if (!gear) {
    throw new AppError(httpStatus.NOT_FOUND, "Gear not found");
  }

  // Authorization
  if (
    currentUser.role !== Role.ADMIN &&
    gear.providerId !== currentUser.userId
  ) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not authorized to delete this gear",
    );
  }

  await prisma.gearItem.delete({
    where: {
      id,
    },
  });

  return null;
};

export const GearServices = {
  createGear,
  getAllGears,
  getSingleGear,
  updateGear,
  deleteGear,
};
