import {
  CREDIT_EVENT,
  CREDIT_TYPE,
  PAYMENT_STATUS,
  type PaymentProvider,
  SUBSCRIPTION_STATUS,
} from "@/lib/consts";
import type { SelectPayment } from "@/lib/database/schema";
import { addCreditHistory } from "@/lib/model/creditHistory";
import { createPayment, updatePaymentStatus } from "@/lib/model/payment";
import {
  createSubscription,
  getSubscriptionByProviderId,
  updateSubscriptionPeriod,
  updateSubscriptionStatus,
} from "@/lib/model/subscription";
import {
  addPermanentCredits,
  addSubscriptionCredits,
} from "@/lib/model/userBalance";
import { getProduct } from "~/lib/payment/product";

type PaymentRow = SelectPayment;

/**
 * Grant permanent credits for a one-time purchase.
 * Idempotent when payment is already paid.
 */
export async function fulfillOneTimePurchase(
  payment: PaymentRow,
  options: { providerSessionId?: string } = {},
): Promise<{ granted: boolean }> {
  if (payment.status === PAYMENT_STATUS.PAID) {
    console.log("Payment already PAID, skipping one-time fulfillment", {
      paymentId: payment.id,
    });
    return { granted: false };
  }

  const sessionId = options.providerSessionId ?? payment.providerSessionId;

  await updatePaymentStatus(
    payment.id,
    PAYMENT_STATUS.PAID,
    sessionId ?? undefined,
  );

  await addPermanentCredits(payment.userId, Number(payment.creditsAmount));

  await addCreditHistory({
    userId: payment.userId,
    amount: payment.creditsAmount,
    creditType: CREDIT_TYPE.PERMANENT,
    creditEvent: CREDIT_EVENT.PURCHASE,
    description: "One-time purchase credits",
    referenceId: sessionId ?? String(payment.id),
  });

  return { granted: true };
}

/**
 * Create subscription + grant subscription credits for first activation.
 * Idempotent when payment already paid or provider subscription already exists.
 */
export async function fulfillNewSubscription(
  payment: PaymentRow,
  options: {
    provider: PaymentProvider | string;
    providerSubscriptionId: string;
    periodStart: Date;
    periodEnd: Date;
    providerSessionId?: string;
  },
): Promise<{ granted: boolean }> {
  const sessionId =
    options.providerSessionId ??
    payment.providerSessionId ??
    options.providerSubscriptionId;

  if (payment.status !== PAYMENT_STATUS.PAID) {
    await updatePaymentStatus(payment.id, PAYMENT_STATUS.PAID, sessionId);
  }

  const existing = await getSubscriptionByProviderId(
    options.providerSubscriptionId,
  );

  if (existing) {
    console.log("Subscription already exists, skipping credit grant", {
      subscriptionId: options.providerSubscriptionId,
    });
    await updateSubscriptionStatus(
      options.providerSubscriptionId,
      SUBSCRIPTION_STATUS.ACTIVE,
    );
    await updateSubscriptionPeriod(
      options.providerSubscriptionId,
      options.periodStart,
      options.periodEnd,
    );
    return { granted: false };
  }

  await createSubscription({
    userId: payment.userId,
    provider: options.provider,
    providerSubscriptionId: options.providerSubscriptionId,
    status: SUBSCRIPTION_STATUS.ACTIVE,
    planId: payment.planId,
    periodStart: options.periodStart,
    periodEnd: options.periodEnd,
  });

  await addSubscriptionCredits(
    payment.userId,
    Number(payment.creditsAmount),
    options.periodEnd,
  );

  await addCreditHistory({
    userId: payment.userId,
    amount: payment.creditsAmount,
    creditType: CREDIT_TYPE.SUBSCRIPTION,
    creditEvent: CREDIT_EVENT.SUBSCRIPTION_GRANT,
    description: "Subscription credits granted",
    referenceId: options.providerSubscriptionId,
  });

  return { granted: true };
}

/**
 * Renew an existing subscription: update period, write paid payment row, re-grant credits.
 * Idempotent when periodEnd is unchanged.
 */
export async function fulfillSubscriptionRenewal(
  localSubscription: {
    userId: string;
    planId: string;
    provider: string;
    providerSubscriptionId: string;
  },
  options: {
    periodStart: Date;
    periodEnd: Date;
    amountCents?: number;
  },
): Promise<{ granted: boolean }> {
  await updateSubscriptionStatus(
    localSubscription.providerSubscriptionId,
    SUBSCRIPTION_STATUS.ACTIVE,
  );

  const isChanged = await updateSubscriptionPeriod(
    localSubscription.providerSubscriptionId,
    options.periodStart,
    options.periodEnd,
  );

  if (!isChanged) {
    console.log("Subscription renewal already handled, skipping", {
      subscriptionId: localSubscription.providerSubscriptionId,
    });
    return { granted: false };
  }

  const product = getProduct(localSubscription.planId);
  const amountCents = options.amountCents ?? Math.round(product.price * 100);

  await createPayment({
    userId: localSubscription.userId,
    amount: amountCents,
    planId: localSubscription.planId,
    provider: localSubscription.provider,
    creditType: CREDIT_TYPE.SUBSCRIPTION,
    creditsAmount: product.creditsAmount,
    status: PAYMENT_STATUS.PAID,
  });

  await addSubscriptionCredits(
    localSubscription.userId,
    product.creditsAmount,
    options.periodEnd,
  );

  await addCreditHistory({
    userId: localSubscription.userId,
    amount: product.creditsAmount,
    creditType: CREDIT_TYPE.SUBSCRIPTION,
    creditEvent: CREDIT_EVENT.SUBSCRIPTION_GRANT,
    description: "Subscription renewal credits",
    referenceId: localSubscription.providerSubscriptionId,
  });

  return { granted: true };
}

export async function markSubscriptionCanceled(
  providerSubscriptionId: string,
): Promise<void> {
  await updateSubscriptionStatus(
    providerSubscriptionId,
    SUBSCRIPTION_STATUS.CANCELED,
  );
}

export async function syncSubscriptionState(
  providerSubscriptionId: string,
  status: string,
  periodStart: Date,
  periodEnd: Date,
): Promise<void> {
  await updateSubscriptionStatus(providerSubscriptionId, status);
  await updateSubscriptionPeriod(
    providerSubscriptionId,
    periodStart,
    periodEnd,
  );
}
