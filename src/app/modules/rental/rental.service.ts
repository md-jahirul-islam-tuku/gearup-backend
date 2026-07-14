import httpStatus from "http-status";
import { prisma } from "../../config/prisma";
import AppError from "../../errors/AppError";
import { TCreateRental, TGetMyRentalsQuery } from "./rental.interface";
import { RentalStatus } from "../../../../generated/prisma/enums";
import { calculatePagination } from "../../utils/pagination";

const createRental = async (payload: TCreateRental, userId: string) => {
  const gear = await prisma.gearItem.findUnique({
    where: {
      id: payload.gearItemId,
    },
  });

  if (!gear) {
    throw new AppError(httpStatus.NOT_FOUND, "Gear not found");
  }

  if (!gear.isAvailable) {
    throw new AppError(httpStatus.BAD_REQUEST, "Gear is not available");
  }

  if (gear.stock < payload.quantity) {
    throw new AppError(httpStatus.BAD_REQUEST, "Insufficient stock");
  }

  if (gear.providerId === userId) {
    throw new AppError(httpStatus.BAD_REQUEST, "You cannot rent your own gear");
  }

  const startDate = new Date(payload.startDate);
  const endDate = new Date(payload.endDate);

  if (endDate <= startDate) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "End date must be after start date",
    );
  }

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid rental dates");
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (startDate < today) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Start date cannot be in the past",
    );
  }

  const millisecondsPerDay = 1000 * 60 * 60 * 24;

  const rentalDays =
    Math.ceil((endDate.getTime() - startDate.getTime()) / millisecondsPerDay) +
    1;

  const totalAmount = Number(gear.pricePerDay) * payload.quantity * rentalDays;

  const result = await prisma.$transaction(async (tx) => {
    await tx.gearItem.update({
      where: {
        id: gear.id,
      },

      data: {
        stock: {
          decrement: payload.quantity,
        },

        isAvailable: gear.stock - payload.quantity > 0,
      },
    });

    const rental = await tx.rentalOrder.create({
      data: {
        customerId: userId,

        gearItemId: gear.id,

        quantity: payload.quantity,

        startDate,

        endDate,

        totalAmount,

        status: RentalStatus.PLACED,
      },

      include: {
        gearItem: {
          include: {
            category: true,
          },
        },
      },
    });
    return rental;
  });

  return result;
};

const getMyRentals = async (userId: string, query: TGetMyRentalsQuery) => {
  const { page, limit, skip } = calculatePagination(query);

  const whereClause = {
    customerId: userId,
    ...(query.status && {
      status: query.status as RentalStatus,
    }),
  };

  const [rentals, total] = await prisma.$transaction([
    prisma.rentalOrder.findMany({
      where: whereClause,

      include: {
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

    data: rentals,
  };
};

export const RentalServices = {
  createRental,
  getMyRentals,
};
