import { createCreem } from "creem_io";
import { PAYMENT_STATUS } from "@/lib/consts";
import { createPayment, updatePaymentSessionId } from "@/lib/model/payment";
import { isDevelopment, serverEnv } from "~/lib/env.server";
import { getProduct } from "~/lib/payment/product";

export const creem = createCreem({
  apiKey: serverEnv.CREEM_API_KEY,
  webhookSecret: serverEnv.CREEM_WEBHOOK_SECRET,
  testMode: isDevelopment,
});

export async function createCheckout(planId: string, userId: string) {
  const product = getProduct(planId);

  if (!product) {
    throw new Error(`Product not found for planId: ${planId}`);
  }
  if (!product.productId) {
    throw new Error(`Missing Creem product ID for planId: ${planId}`);
  }

  try {
    // Create payment record first
    const payment = await createPayment({
      userId,
      amount: Math.round(product.price * 100), // Convert to cents
      currency: "USD",
      planId,
      provider: "creem",
      creditType: product.creditType,
      creditsAmount: product.creditsAmount,
      status: PAYMENT_STATUS.PENDING,
    });

    const successUrl = new URL("/payment/success", serverEnv.APP_URL);
    successUrl.searchParams.set("public_id", payment.publicId);

    // Create a checkout session
    const checkout = await creem.checkouts.create({
      productId: product.productId,
      successUrl: successUrl.toString(),
      metadata: { payment_id: payment.id.toString() },
    });

    await updatePaymentSessionId(payment.id, checkout.id);

    return checkout;
  } catch (error) {
    console.error("Error creating creem checkout:", error);
    throw new Error("Failed to create checkout");
  }
}
