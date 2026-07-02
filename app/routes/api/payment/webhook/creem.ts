import { data } from "react-router";
import {
  CREDIT_EVENT,
  CREDIT_TYPE,
  PAYMENT_STATUS,
  SUBSCRIPTION_STATUS,
} from "@/lib/consts";
import { addCreditHistory } from "@/lib/model/creditHistory";
import {
  createPayment,
  getPaymentById,
  getPaymentBySessionId,
  updatePaymentStatus,
} from "@/lib/model/payment";
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
import { creem } from "~/lib/payment/creem/creem.server";
import { getProduct } from "~/lib/payment/product";
import type { Route } from "./+types/creem";

async function getLocalPayment(checkoutId?: string, paymentId?: string) {
  return (
    (paymentId ? await getPaymentById(Number(paymentId)) : null) ||
    (checkoutId ? await getPaymentBySessionId(checkoutId) : null)
  );
}

async function syncSubscriptionState(
  providerSubscriptionId: string,
  status: string,
  periodStart: Date,
  periodEnd: Date,
) {
  await updateSubscriptionStatus(providerSubscriptionId, status);
  return updateSubscriptionPeriod(
    providerSubscriptionId,
    periodStart,
    periodEnd,
  );
}

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return data({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const requestBody = await request.text();
    const signature = request.headers.get("creem-signature") ?? "";

    await creem.webhooks.handleEvents(requestBody, signature, {
      onCheckoutCompleted: async (checkout) => {
        const billingType = checkout.product.billingType;
        const checkoutId = checkout.id;
        const paymentId =
          typeof checkout.metadata?.payment_id === "string" ||
          typeof checkout.metadata?.payment_id === "number"
            ? String(checkout.metadata.payment_id)
            : undefined;
        const payment = await getLocalPayment(checkoutId, paymentId);

        console.log("Received checkout.completed webhook:", {
          checkoutId,
          billingType,
          paymentId,
        });

        if (!payment) {
          throw new Error("Unable to match payment from checkout.completed");
        }

        if (payment.status === PAYMENT_STATUS.PAID) {
          console.log("Payment already marked as PAID, skipping...");
          return;
        }

        // recurring = subscription, one-time = one-time purchase
        if (billingType === "recurring") {
          console.log("Scenario: New subscription created");

          const creemSubscription = checkout.subscription;
          if (!creemSubscription) {
            throw new Error("Missing subscription data in webhook");
          }

          await updatePaymentStatus(
            payment.id,
            PAYMENT_STATUS.PAID,
            checkoutId,
          );

          const existingSubscription = await getSubscriptionByProviderId(
            creemSubscription.id,
          );

          if (existingSubscription) {
            console.log("Subscription already exists, skipping credit grant", {
              subscriptionId: creemSubscription.id,
            });
            await syncSubscriptionState(
              creemSubscription.id,
              SUBSCRIPTION_STATUS.ACTIVE,
              new Date(creemSubscription.currentPeriodStartDate),
              new Date(creemSubscription.currentPeriodEndDate),
            );
            return;
          }

          await createSubscription({
            userId: payment.userId,
            provider: "creem",
            providerSubscriptionId: creemSubscription.id,
            status: SUBSCRIPTION_STATUS.ACTIVE,
            planId: payment.planId,
            periodStart: new Date(creemSubscription.currentPeriodStartDate),
            periodEnd: new Date(creemSubscription.currentPeriodEndDate),
          });

          await addSubscriptionCredits(
            payment.userId,
            Number(payment.creditsAmount),
            new Date(creemSubscription.currentPeriodEndDate),
          );

          await addCreditHistory({
            userId: payment.userId,
            amount: payment.creditsAmount,
            creditType: CREDIT_TYPE.SUBSCRIPTION,
            creditEvent: CREDIT_EVENT.SUBSCRIPTION_GRANT,
            description: "Subscription credits granted",
            referenceId: creemSubscription.id,
          });
        } else {
          console.log("Scenario: One-time purchase");

          await updatePaymentStatus(
            payment.id,
            PAYMENT_STATUS.PAID,
            checkoutId,
          );

          await addPermanentCredits(
            payment.userId,
            Number(payment.creditsAmount),
          );

          await addCreditHistory({
            userId: payment.userId,
            amount: payment.creditsAmount,
            creditType: CREDIT_TYPE.PERMANENT,
            creditEvent: CREDIT_EVENT.PURCHASE,
            description: "One-time purchase credits",
            referenceId: checkoutId,
          });
        }
      },
      onSubscriptionPaid: async (subscription) => {
        console.log("Received subscription.paid webhook:", {
          subscriptionId: subscription.id,
          status: subscription.status,
        });

        const localSubscription = await getSubscriptionByProviderId(
          subscription.id,
        );
        if (!localSubscription) {
          console.log("Subscription not found locally, skipping renewal", {
            subscriptionId: subscription.id,
          });
          return;
        }

        console.log("Scenario: Subscription renewal");

        await updateSubscriptionStatus(
          subscription.id,
          SUBSCRIPTION_STATUS.ACTIVE,
        );

        const isChanged = await updateSubscriptionPeriod(
          subscription.id,
          new Date(subscription.currentPeriodStartDate),
          new Date(subscription.currentPeriodEndDate),
        );
        if (!isChanged) {
          console.log("subscription renewal had been handled, skipping...");
          return;
        }

        const product = getProduct(localSubscription.planId);

        await createPayment({
          userId: localSubscription.userId,
          amount: subscription.product.price,
          planId: localSubscription.planId,
          provider: "creem",
          creditType: CREDIT_TYPE.SUBSCRIPTION,
          creditsAmount: product.creditsAmount,
          status: PAYMENT_STATUS.PAID,
        });

        await addSubscriptionCredits(
          localSubscription.userId,
          product.creditsAmount,
          new Date(subscription.currentPeriodEndDate),
        );

        await addCreditHistory({
          userId: localSubscription.userId,
          amount: product.creditsAmount,
          creditType: CREDIT_TYPE.SUBSCRIPTION,
          creditEvent: CREDIT_EVENT.SUBSCRIPTION_GRANT,
          description: "Subscription renewal credits",
          referenceId: subscription.id,
        });
      },
      onSubscriptionCanceled: async (subscription) => {
        console.log("Received subscription.canceled webhook:", {
          subscriptionId: subscription.id,
          status: subscription.status,
        });

        const localSubscription = await getSubscriptionByProviderId(
          subscription.id,
        );
        if (!localSubscription) {
          console.log("Subscription not found locally, skipping cancel sync", {
            subscriptionId: subscription.id,
          });
          return;
        }

        await updateSubscriptionStatus(
          subscription.id,
          SUBSCRIPTION_STATUS.CANCELED,
        );
      },
      onSubscriptionUpdate: async (subscription) => {
        console.log("Received subscription.update webhook:", {
          subscriptionId: subscription.id,
          status: subscription.status,
        });

        const localSubscription = await getSubscriptionByProviderId(
          subscription.id,
        );
        if (!localSubscription) {
          console.log("Subscription not found locally, skipping update sync", {
            subscriptionId: subscription.id,
          });
          return;
        }

        await syncSubscriptionState(
          subscription.id,
          subscription.status === "canceled"
            ? SUBSCRIPTION_STATUS.CANCELED
            : SUBSCRIPTION_STATUS.ACTIVE,
          new Date(subscription.currentPeriodStartDate),
          new Date(subscription.currentPeriodEndDate),
        );
      },
    });

    return data({ success: true });
  } catch (error) {
    console.error("Creem webhook error:", error);
    return data(
      {
        error:
          error instanceof Error ? error.message : "Webhook processing failed",
      },
      { status: 500 },
    );
  }
}
