import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { PAYMENT_STATUS } from "~/lib/consts";
import {
  getPaymentByPublicId,
  getPaymentBySessionId,
} from "~/lib/model/payment";
import { type CheckoutResult, createCheckoutForPlan } from "~/lib/payment";
import { authedProcedure, router } from "./init";
import type { CheckoutCreateResult, PaymentStatusResult } from "./types";

const createCheckoutSchema = z.object({
  planId: z.string(),
});

const checkStatusSchema = z
  .object({
    publicId: z.string().min(1).optional(),
    sessionId: z.string().min(1).optional(),
  })
  .refine((value) => value.publicId || value.sessionId, {
    message: "publicId or sessionId is required",
  });

export const paymentRouter = router({
  createCheckout: authedProcedure
    .input(createCheckoutSchema)
    .mutation(async ({ ctx, input }): Promise<CheckoutCreateResult> => {
      try {
        const checkout: CheckoutResult = await createCheckoutForPlan(
          input.planId,
          ctx.user.id,
        );

        return {
          checkoutUrl: checkout.url,
          checkoutId: checkout.id,
        };
      } catch (error) {
        console.error("Checkout creation failed:", error);

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            error instanceof Error ? error.message : "Checkout creation failed",
        });
      }
    }),

  checkStatus: authedProcedure
    .input(checkStatusSchema)
    .query(async ({ ctx, input }): Promise<PaymentStatusResult> => {
      const payment = input.publicId
        ? await getPaymentByPublicId(input.publicId)
        : await getPaymentBySessionId(input.sessionId ?? "");

      if (!payment || payment.userId !== ctx.user.id) {
        return {
          status: input.publicId ? "not_found" : PAYMENT_STATUS.PENDING,
        };
      }

      const status =
        payment.status === PAYMENT_STATUS.PAID ||
        payment.status === PAYMENT_STATUS.CANCELED
          ? payment.status
          : PAYMENT_STATUS.PENDING;

      return {
        status,
        amount: payment.amount,
        currency: payment.currency,
        creditsAmount: payment.creditsAmount,
        creditType: payment.creditType,
        planId: payment.planId,
        provider: payment.provider,
      };
    }),
});
