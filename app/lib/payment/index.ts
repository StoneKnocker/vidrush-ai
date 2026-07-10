import { PAYMENT_PROVIDER, type PaymentProvider } from "@/lib/consts";
import { createCheckout as createCreemCheckout } from "./creem/creem.server";
import { createPaypalCheckout, isPaypalEnabled } from "./paypal/paypal.server";

export interface CheckoutResult {
  url: string;
  id: string;
  publicId?: string;
}

export function getEnabledPaymentProviders(): PaymentProvider[] {
  const providers: PaymentProvider[] = [PAYMENT_PROVIDER.CREEM];
  if (isPaypalEnabled()) {
    providers.push(PAYMENT_PROVIDER.PAYPAL);
  }
  return providers;
}

export function isProviderEnabled(provider: PaymentProvider): boolean {
  if (provider === PAYMENT_PROVIDER.CREEM) return true;
  if (provider === PAYMENT_PROVIDER.PAYPAL) return isPaypalEnabled();
  return false;
}

export async function createCheckoutForPlan(
  planId: string,
  userId: string,
  provider: PaymentProvider = PAYMENT_PROVIDER.CREEM,
): Promise<CheckoutResult> {
  if (!isProviderEnabled(provider)) {
    throw new Error(`Payment provider '${provider}' is not enabled`);
  }

  if (provider === PAYMENT_PROVIDER.PAYPAL) {
    const checkout = await createPaypalCheckout(planId, userId);
    return {
      url: checkout.checkoutUrl,
      id: checkout.id,
      publicId: checkout.publicId,
    };
  }

  const checkout = await createCreemCheckout(planId, userId);
  return {
    url: checkout.checkoutUrl ?? "",
    id: checkout.id,
  };
}
