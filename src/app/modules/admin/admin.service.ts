import httpStatus from "http-status";
import { prisma } from "../../config/prisma";
import {
  TAdminGearQuery,
  TAdminQuery,
  TAdminRentalQuery,
  TUpdateUserStatus,
} from "./admin.interface";
import { Prisma, Role, UserStatus } from "../../../../generated/prisma/client";
import AppError from "../../errors/AppError";

const getAllUsers = async (query: TAdminQuery) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const where: Prisma.UserWhereInput = {};

  if (query.searchTerm) {
    where.OR = [
      {
        name: {
          contains: query.searchTerm,
          mode: "insensitive",
        },
      },
      {
        email: {
          contains: query.searchTerm,
          mode: "insensitive",
        },
      },
    ];
  }

  if (query.role) {
    where.role = query.role as Role;
  }

  if (query.status) {
    where.status = query.status as UserStatus;
  }

  const [users, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,

      omit: {
        password: true,
      },

      orderBy: {
        createdAt: "desc",
      },

      skip,
      take: limit,
    }),

    prisma.user.count({
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

    data: users,
  };
};

const updateUserStatus = async (
  userId: string,
  payload: TUpdateUserStatus,
  currentAdminId: string,
) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  // Admin নিজের Account Suspend করতে পারবে না
  if (user.id === currentAdminId) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "You cannot change your own status",
    );
  }

  // একই Status আবার সেট করতে দেবে না
  if (user.status === payload.status) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `User is already ${payload.status.toLowerCase()}`,
    );
  }

  const updatedUser = await prisma.user.update({
    where: {
      id: userId,
    },

    data: {
      status: payload.status,
    },

    omit: {
      password: true,
    },
  });

  return updatedUser;
};

const getAllGear = async (query: TAdminGearQuery) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const where: Prisma.GearItemWhereInput = {};

  if (query.searchTerm) {
    where.OR = [
      {
        name: {
          contains: query.searchTerm,
          mode: "insensitive",
        },
      },
      {
        brand: {
          contains: query.searchTerm,
          mode: "insensitive",
        },
      },
    ];
  }

  if (query.categoryId) {
    where.categoryId = query.categoryId;
  }

  if (query.providerId) {
    where.providerId = query.providerId;
  }

  if (query.isAvailable !== undefined) {
    where.isAvailable = query.isAvailable === "true";
  }

  const [gears, total] = await prisma.$transaction([
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

      orderBy: {
        createdAt: "desc",
      },

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

    data: gears,
  };
};

const getAllRentals = async (query: TAdminRentalQuery) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const where: Prisma.RentalOrderWhereInput = {};

  if (query.status) {
    where.status = query.status;
  }

  const [rentals, total] = await prisma.$transaction([
    prisma.rentalOrder.findMany({
      where,

      include: {
        customer: {
          omit: {
            password: true,
          },
        },

        gearItem: {
          include: {
            category: true,

            provider: {
              omit: {
                password: true,
              },
            },
          },
        },

        payment: true,
      },

      orderBy: {
        createdAt: "desc",
      },

      skip,
      take: limit,
    }),

    prisma.rentalOrder.count({
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

    data: rentals,
  };
};

export const AdminServices = {
  getAllUsers,
  updateUserStatus,
  getAllGear,
  getAllRentals,
};
