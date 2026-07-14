import httpStatus from "http-status";
import { RentalStatus } from "../../../../generated/prisma/enums";
import { prisma } from "../../config/prisma";
import AppError from "../../errors/AppError";
import { TCreateReview } from "./review.interface";

const createReview = async (payload: TCreateReview, customerId: string) => {
  // Rental exists?
  const rental = await prisma.rentalOrder.findUnique({
    where: {
      id: payload.rentalOrderId,
    },
    include: {
      gearItem: true,
    },
  });

  if (!rental) {
    throw new AppError(httpStatus.NOT_FOUND, "Rental order not found");
  }

  // Own rental?
  if (rental.customerId !== customerId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not authorized to review this rental",
    );
  }

  // Returned?
  if (rental.status !== RentalStatus.RETURNED) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "You can review only returned rentals",
    );
  }

  // Already reviewed?
  const existingReview = await prisma.review.findUnique({
    where: {
      customerId_gearItemId: {
        customerId,
        gearItemId: rental.gearItemId,
      },
    },
  });

  if (existingReview) {
    throw new AppError(
      httpStatus.CONFLICT,
      "You have already reviewed this gear",
    );
  }

  // Create review
  const review = await prisma.review.create({
    data: {
      rating: payload.rating,
      comment: payload.comment,
      customerId,
      gearItemId: rental.gearItemId,
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
    },
  });

  return review;
};

const getGearReviews = async (gearId: string) => {
  const gear = await prisma.gearItem.findUnique({
    where: {
      id: gearId,
    },
  });

  if (!gear) {
    throw new AppError(httpStatus.NOT_FOUND, "Gear not found");
  }

  const [reviews, aggregate] = await prisma.$transaction([
    prisma.review.findMany({
      where: {
        gearItemId: gearId,
      },

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
    }),

    prisma.review.aggregate({
      where: {
        gearItemId: gearId,
      },

      _avg: {
        rating: true,
      },

      _count: {
        id: true,
      },
    }),
  ]);

  return {
    averageRating: Number(aggregate._avg.rating ?? 0).toFixed(1),
    totalReviews: aggregate._count.id,
    reviews,
  };
};

export const ReviewServices = {
  createReview,
  getGearReviews,
};
