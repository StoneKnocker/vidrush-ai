import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { PAYMENT_PROVIDER, PAYMENT_STATUS } from "~/lib/consts";
import {
  getPaymentByPublicId,
  getPaymentBySessionId,
} from "~/lib/model/payment";
import {
  type CheckoutResult,
  createCheckoutForPlan,
  getEnabledPaymentProviders,
} from "~/lib/payment";
import { confirmPaypalPayment } from "~/lib/payment/paypal/paypal.server";
import { authedProcedure, publicProcedure, router } from "./init";
import type { CheckoutCreateResult, PaymentStatusResult } from "./types";

const providerSchema = z.enum([
  PAYMENT_PROVIDER.CREEM,
  PAYMENT_PROVIDER.PAYPAL,
]);

const createCheckoutSchema = z.object({
  planId: z.string(),
  provider: providerSchema.default(PAYMENT_PROVIDER.CREEM),
});

const checkStatusSchema = z
  .object({
    publicId: z.string().min(1).optional(),
    sessionId: z.string().min(1).optional(),
  })
  .refine((value) => value.publicId || value.sessionId, {
    message: "publicId or sessionId is required",
  });

const confirmCheckoutSchema = z.object({
  publicId: z.string().min(1),
});

function mapPaymentToStatusResult(payment: {
  status: string;
  amount: number;
  currency: string;
  creditsAmount: number;
  creditType: string;
  planId: string;
  provider: string;
}): PaymentStatusResult {
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
}

export const paymentRouter = router({
  listProviders: publicProcedure.query(() => {
    return { providers: getEnabledPaymentProviders() };
  }),

  createCheckout: authedProcedure
    .input(createCheckoutSchema)
    .mutation(async ({ ctx, input }): Promise<CheckoutCreateResult> => {
      try {
        const checkout: CheckoutResult = await createCheckoutForPlan(
          input.planId,
          ctx.user.id,
          input.provider,
        );

        return {
          checkoutUrl: checkout.url,
          checkoutId: checkout.id,
          publicId: checkout.publicId,
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

  /**
   * Sync-confirm PayPal payment after return_url redirect (capture / activate).
   * Safe to call for Creem payments (no-op beyond status read).
   */
  confirmCheckout: authedProcedure
    .input(confirmCheckoutSchema)
    .mutation(async ({ ctx, input }): Promise<PaymentStatusResult> => {
      try {
        const payment = await getPaymentByPublicId(input.publicId);

        if (!payment || payment.userId !== ctx.user.id) {
          return { status: "not_found" };
        }

        if (payment.provider === PAYMENT_PROVIDER.PAYPAL) {
          return await confirmPaypalPayment(input.publicId, ctx.user.id);
        }

        return mapPaymentToStatusResult(payment);
      } catch (error) {
        console.error("Confirm checkout failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            error instanceof Error ? error.message : "Confirm checkout failed",
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

      return mapPaymentToStatusResult(payment);
    }),
});
