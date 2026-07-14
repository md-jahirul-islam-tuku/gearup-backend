import httpStatus from "http-status";
import { prisma } from "../../config/prisma";
import { TAdminQuery, TUpdateUserStatus } from "./admin.interface";
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

export const AdminServices = {
  getAllUsers,
  updateUserStatus,
};
