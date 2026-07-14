import { prisma } from "../../config/prisma";
import { TAdminQuery } from "./admin.interface";
import { Prisma, Role, UserStatus } from "../../../../generated/prisma/client";

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

export const AdminServices = {
  getAllUsers,
};
