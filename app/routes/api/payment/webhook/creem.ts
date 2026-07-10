import { data } from "react-router";
import { PAYMENT_STATUS, SUBSCRIPTION_STATUS } from "@/lib/consts";
import { getPaymentById, getPaymentBySessionId } from "@/lib/model/payment";
import { getSubscriptionByProviderId } from "@/lib/model/subscription";
import { creem } from "~/lib/payment/creem/creem.server";
import {
  fulfillNewSubscription,
  fulfillOneTimePurchase,
  fulfillSubscriptionRenewal,
  markSubscriptionCanceled,
  syncSubscriptionState,
} from "~/lib/payment/fulfillment.server";
import type { Route } from "./+types/creem";

async function getLocalPayment(checkoutId?: string, paymentId?: string) {
  return (
    (paymentId ? await getPaymentById(Number(paymentId)) : null) ||
    (checkoutId ? await getPaymentBySessionId(checkoutId) : null)
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

        if (billingType === "recurring") {
          console.log("Scenario: New subscription created");

          const creemSubscription = checkout.subscription;
          if (!creemSubscription) {
            throw new Error("Missing subscription data in webhook");
          }

          await fulfillNewSubscription(payment, {
            provider: "creem",
            providerSubscriptionId: creemSubscription.id,
            periodStart: new Date(creemSubscription.currentPeriodStartDate),
            periodEnd: new Date(creemSubscription.currentPeriodEndDate),
            providerSessionId: checkoutId,
          });
        } else {
          console.log("Scenario: One-time purchase");
          await fulfillOneTimePurchase(payment, {
            providerSessionId: checkoutId,
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

        await fulfillSubscriptionRenewal(localSubscription, {
          periodStart: new Date(subscription.currentPeriodStartDate),
          periodEnd: new Date(subscription.currentPeriodEndDate),
          amountCents: subscription.product.price,
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

        await markSubscriptionCanceled(subscription.id);
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
