import httpStatus from "http-status";

import { prisma } from "../../config/prisma";
import AppError from "../../errors/AppError";

import { TCreateGear, TUpdateGear } from "./gear.interface";
import {
  RentalStatus,
  Role,
  UserStatus,
} from "../../../../generated/prisma/enums";
import { calculatePagination } from "../../utils/pagination";
import { Prisma } from "../../../../generated/prisma/client";
import { TCurrentUser } from "../../types/current-user";
import { JwtPayload } from "jsonwebtoken";

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

  const category = query.category as string | undefined;

  const brand = query.brand as string | undefined;

  const minPrice = query.minPrice ? Number(query.minPrice) : undefined;

  const maxPrice = query.maxPrice ? Number(query.maxPrice) : undefined;

  const startDate = query.startDate
    ? new Date(query.startDate as string)
    : undefined;

  const endDate = query.endDate ? new Date(query.endDate as string) : undefined;

  const sortBy = query.sortBy as string | undefined;

  const sortOrder: Prisma.SortOrder =
    query.sortOrder === "asc" ? "asc" : "desc";

  if (minPrice !== undefined && (Number.isNaN(minPrice) || minPrice < 0)) {
    throw new Error("Invalid minPrice");
  }

  if (maxPrice !== undefined && (Number.isNaN(maxPrice) || maxPrice < 0)) {
    throw new Error("Invalid maxPrice");
  }

  if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) {
    throw new Error("minPrice cannot be greater than maxPrice");
  }

  if (
    (startDate && Number.isNaN(startDate.getTime())) ||
    (endDate && Number.isNaN(endDate.getTime()))
  ) {
    throw new Error("Invalid startDate or endDate");
  }

  // Both dates are required for availability search
  if ((startDate && !endDate) || (!startDate && endDate)) {
    throw new Error(
      "Both startDate and endDate are required for availability search",
    );
  }

  if (startDate && endDate && startDate > endDate) {
    throw new Error("startDate cannot be greater than endDate");
  }

  const { page, limit } = calculatePagination(query);

  const andConditions: Prisma.GearItemWhereInput[] = [
    {
      isAvailable: true,
    },
  ];

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

  if (brand) {
    andConditions.push({
      brand: {
        contains: brand,
        mode: "insensitive",
      },
    });
  }

  if (category) {
    andConditions.push({
      category: {
        name: {
          equals: category,
          mode: "insensitive",
        },
      },
    });
  }

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

  const whereConditions: Prisma.GearItemWhereInput = {
    AND: andConditions,
  };

  // eslint-disable-next-line no-useless-assignment
  let orderBy: Prisma.GearItemOrderByWithRelationInput = {
    createdAt: "desc",
  };

  switch (sortBy) {
    case "pricePerDay":
      orderBy = {
        pricePerDay: sortOrder,
      };
      break;

    case "createdAt":
      orderBy = {
        createdAt: sortOrder,
      };
      break;

    case "stock":
      orderBy = {
        stock: sortOrder,
      };
      break;

    case "category":
      orderBy = {
        category: {
          name: sortOrder,
        },
      };
      break;

    default:
      orderBy = {
        createdAt: "desc",
      };
  }

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
  });

  let availableGears = gears;

  if (startDate && endDate) {
    // These statuses consume/block stock.
    const reservingStatuses: RentalStatus[] = [
      RentalStatus.PLACED,
      RentalStatus.CONFIRMED,
      RentalStatus.PICKED_UP,
    ];

    const rentals = await prisma.rentalOrder.findMany({
      where: {
        gearItemId: {
          in: gears.map((gear) => gear.id),
        },

        startDate: {
          lte: endDate,
        },

        endDate: {
          gte: startDate,
        },

        status: {
          in: reservingStatuses,
        },
      },

      select: {
        gearItemId: true,
        quantity: true,
      },
    });

    const rentedQuantityMap = new Map<string, number>();

    for (const rental of rentals) {
      const currentQuantity = rentedQuantityMap.get(rental.gearItemId) ?? 0;

      rentedQuantityMap.set(
        rental.gearItemId,
        currentQuantity + rental.quantity,
      );
    }

    availableGears = gears
      .map((gear) => {
        const rentedQuantity = rentedQuantityMap.get(gear.id) ?? 0;

        const availableStock = gear.stock - rentedQuantity;

        return {
          ...gear,

          availableStock,

          isAvailable: availableStock > 0,
        };
      })

      .filter((gear) => gear.availableStock > 0);
  }

  const total = availableGears.length;

  const totalPage = Math.ceil(total / limit);

  const skip = (page - 1) * limit;

  const paginatedGears = availableGears.slice(skip, skip + limit);

  return {
    meta: {
      page,
      limit,
      total,
      totalPage,
    },

    data: paginatedGears,
  };
};

const getMyGears = async (user: JwtPayload, query: Record<string, unknown>) => {
  const { page, limit, skip } = calculatePagination(query);

  const searchTerm = query.searchTerm?.toString();

  const category = query.category?.toString();

  const isAvailable = query.isAvailable as string | undefined;

  const sortableFields = ["pricePerDay", "createdAt", "stock"] as const;

  const sortBy = query.sortBy as string | undefined;

  const sortOrder = query.sortOrder === "asc" ? "asc" : "desc";

  const where: Prisma.GearItemWhereInput = {
    providerId: user.userId,
  };

  if (searchTerm) {
    where.OR = [
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
    ];
  }

  if (category) {
    where.categoryId = category;
  }

  if (isAvailable === "true") {
    where.isAvailable = true;
  }

  if (isAvailable === "false") {
    where.isAvailable = false;
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

  const [data, total] = await prisma.$transaction([
    prisma.gearItem.findMany({
      where,

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
    }),

    prisma.gearItem.count({
      where,
    }),
  ]);

  return {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },

    data,
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
    where: { id },
  });

  if (!gear) {
    throw new AppError(httpStatus.NOT_FOUND, "Gear not found");
  }

  if (
    currentUser.role !== Role.ADMIN &&
    gear.providerId !== currentUser.userId
  ) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not authorized to delete this gear",
    );
  }

  try {
    await prisma.gearItem.delete({
      where: { id },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2003"
    ) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "This gear has existing rental orders and cannot be deleted. You may mark it as unavailable instead.",
      );
    }

    throw error;
  }

  return null;
};

export const GearServices = {
  createGear,
  getAllGears,
  getMyGears,
  getSingleGear,
  updateGear,
  deleteGear,
};
