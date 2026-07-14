import httpStatus from "http-status";
import { prisma } from "../../config/prisma";
import AppError from "../../errors/AppError";
import { TCreateRental, TGetMyRentalsQuery } from "./rental.interface";
import { RentalStatus, Role } from "../../../../generated/prisma/enums";
import { calculatePagination } from "../../utils/pagination";
import { TCurrentUser } from "../../types/current-user";

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

const getSingleRental = async (rentalId: string, currentUser: TCurrentUser) => {
  const rental = await prisma.rentalOrder.findUnique({
    where: {
      id: rentalId,
    },

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
  });

  if (!rental) {
    throw new AppError(httpStatus.NOT_FOUND, "Rental order not found");
  }

  // Admin can access any rental
  if (currentUser.role === Role.ADMIN) {
    return rental;
  }

  // Customer can access only their own rentals
  if (
    currentUser.role === Role.CUSTOMER &&
    rental.customerId !== currentUser.userId
  ) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not authorized to access this rental order",
    );
  }

  // Provider can access only rentals of their own gear
  if (
    currentUser.role === Role.PROVIDER &&
    rental.gearItem.providerId !== currentUser.userId
  ) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not authorized to access this rental order",
    );
  }

  return rental;
};

const getProviderRentals = async (
  providerId: string,
  query: TGetMyRentalsQuery,
) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const whereClause = {
    gearItem: {
      providerId,
    },
    ...(query.status && {
      status: query.status as RentalStatus,
    }),
  };

  const [rentals, total] = await prisma.$transaction([
    prisma.rentalOrder.findMany({
      where: whereClause,

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

const updateRentalStatus = async (
  rentalId: string,
  status: RentalStatus,
  currentUser: TCurrentUser,
) => {
  const rental = await prisma.rentalOrder.findUnique({
    where: {
      id: rentalId,
    },
    include: {
      gearItem: true,
    },
  });

  if (!rental) {
    throw new AppError(httpStatus.NOT_FOUND, "Rental order not found");
  }

  // Only provider who owns the gear can update status
  if (
    currentUser.role !== Role.ADMIN &&
    rental.gearItem.providerId !== currentUser.userId
  ) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not authorized to update this rental",
    );
  }

  // Rental already completed
  if (rental.status === RentalStatus.RETURNED) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Rental has already been returned",
    );
  }

  // Allowed status transitions
  const allowedTransitions: Record<RentalStatus, RentalStatus | null> = {
    PLACED: RentalStatus.CONFIRMED,
    CONFIRMED: RentalStatus.PICKED_UP,
    PICKED_UP: RentalStatus.RETURNED,
    RETURNED: null,
    CANCELLED: null,
  };

  if (allowedTransitions[rental.status] !== status) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Invalid status transition from ${rental.status} to ${status}`,
    );
  }

  // RETURNED -> Update rental + restore stock
  if (status === RentalStatus.RETURNED) {
    return await prisma.$transaction(async (tx) => {
      await tx.gearItem.update({
        where: {
          id: rental.gearItemId,
        },
        data: {
          stock: {
            increment: rental.quantity,
          },
          isAvailable: true,
        },
      });

      const updatedRental = await tx.rentalOrder.update({
        where: {
          id: rental.id,
        },
        data: {
          status,
        },
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
      });

      return updatedRental;
    });
  }

  // CONFIRMED / PICKED_UP
  const updatedRental = await prisma.rentalOrder.update({
    where: {
      id: rental.id,
    },
    data: {
      status,
    },
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
  });

  return updatedRental;
};

export const RentalServices = {
  createRental,
  getMyRentals,
  getSingleRental,
  getProviderRentals,
  updateRentalStatus,
};
