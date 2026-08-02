import httpStatus from "http-status";
import { prisma } from "../../config/prisma";
import {
  TAdminGearQuery,
  TAdminQuery,
  TAdminRentalQuery,
  TGetAllPaymentsQuery,
  TUpdateUserStatus,
} from "./admin.interface";
import {
  PaymentStatus,
  Prisma,
  Role,
  UserStatus,
} from "../../../../generated/prisma/client";
import AppError from "../../errors/AppError";
import { calculatePagination } from "../../utils/pagination";

const getAllUsers = async (query: TAdminQuery) => {
  const { page, limit, skip } = calculatePagination(query);

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
  const { page, limit, skip } = calculatePagination(query);

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
  const { page, limit, skip } = calculatePagination(query);

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

const getAllPayments = async (query: TGetAllPaymentsQuery) => {
  const { page, limit, skip } = calculatePagination(query);

  const searchTerm = query.searchTerm?.trim();

  const whereClause: Prisma.PaymentWhereInput = {
    ...(query.status && {
      status: query.status as PaymentStatus,
    }),

    ...(searchTerm && {
      OR: [
        {
          transactionId: {
            contains: searchTerm,
            mode: "insensitive",
          },
        },
        {
          rentalOrder: {
            customer: {
              name: {
                contains: searchTerm,
                mode: "insensitive",
              },
            },
          },
        },
        {
          rentalOrder: {
            customer: {
              email: {
                contains: searchTerm,
                mode: "insensitive",
              },
            },
          },
        },
      ],
    }),
  };

  const [payments, total] = await prisma.$transaction([
    prisma.payment.findMany({
      where: whereClause,

      include: {
        rentalOrder: {
          include: {
            customer: {
              omit: {
                password: true,
              },
            },

            gearItem: {
              include: {
                category: true,
              },
            },
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },

      skip,
      take: limit,
    }),

    prisma.payment.count({
      where: whereClause,
    }),
  ]);

  return {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },

    data: payments,
  };
};

export const AdminServices = {
  getAllUsers,
  updateUserStatus,
  getAllGear,
  getAllRentals,
  getAllPayments,
};
