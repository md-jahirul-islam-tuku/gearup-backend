import httpStatus from "http-status";

import { prisma } from "../../config/prisma";
import config from "../../config";
import { stripe } from "../../config/stripe";
import AppError from "../../errors/AppError";

import {
  PaymentProvider,
  PaymentStatus,
} from "../../../../generated/prisma/enums";
import { TCurrentUser } from "../../types/current-user";
import Stripe from "stripe";

const createCheckoutSession = async (
  rentalId: string,
  currentUser: TCurrentUser,
) => {
  // Find rental
  const rental = await prisma.rentalOrder.findUnique({
    where: {
      id: rentalId,
    },

    include: {
      gearItem: true,
      payment: true,
    },
  });

  if (!rental) {
    throw new AppError(httpStatus.NOT_FOUND, "Rental order not found");
  }

  // Authorization
  if (rental.customerId !== currentUser.userId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not authorized to pay for this rental",
    );
  }

  // Already paid
  if (rental.payment?.status === PaymentStatus.PAID) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "This rental has already been paid",
    );
  }

  // Create Stripe Checkout Session
  const session = await stripe.checkout.sessions.create({
    mode: "payment",

    payment_method_types: ["card"],
    customer_email: currentUser.email,

    line_items: [
      {
        quantity: 1,

        price_data: {
          currency: "usd",

          unit_amount: Math.round(Number(rental.totalAmount) * 100),

          product_data: {
            name: rental.gearItem.name,

            description: rental.gearItem.description ?? undefined,
          },
        },
      },
    ],

    metadata: {
      rentalId: rental.id,
      customerId: currentUser.userId,
    },

    success_url: `${config.app_url}/payment/success?session_id={CHECKOUT_SESSION_ID}`,

    cancel_url: `${config.app_url}/payment/cancel`,
  });

  if (!session.url) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Failed to create checkout session",
    );
  }

  // Payment already exists
  if (rental.payment) {
    await prisma.payment.update({
      where: {
        rentalOrderId: rental.id,
      },

      data: {
        stripeSessionId: session.id,
        status: PaymentStatus.PENDING,
        amount: rental.totalAmount,
      },
    });
  }

  // Create payment
  else {
    await prisma.payment.create({
      data: {
        rentalOrderId: rental.id,

        stripeSessionId: session.id,

        amount: rental.totalAmount,

        provider: PaymentProvider.STRIPE,

        status: PaymentStatus.PENDING,
      },
    });
  }

  return {
    checkoutUrl: session.url,
  };
};

const stripeWebhook = async (rawBody: Buffer, signature: string) => {
  if (!signature) {
    throw new AppError(httpStatus.BAD_REQUEST, "Stripe signature is missing");
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      config.stripe_webhook_secret,
    );
  } catch {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid webhook signature");
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;

      const payment = await prisma.payment.findUnique({
        where: {
          stripeSessionId: session.id,
        },
      });

      if (!payment) {
        throw new AppError(httpStatus.NOT_FOUND, "Payment not found");
      }

      // একই Webhook একাধিকবার এলে Update না করা
      if (payment.status === PaymentStatus.PAID) {
        return;
      }

      await prisma.payment.update({
        where: {
          stripeSessionId: session.id,
        },
        data: {
          status: PaymentStatus.PAID,
          transactionId: session.payment_intent?.toString(),
          paidAt: new Date(),
        },
      });

      break;
    }

    default:
      break;
  }
};

export const PaymentServices = {
  createCheckoutSession,
  stripeWebhook,
};
