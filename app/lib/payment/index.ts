import { createCheckout as createCreemCheckout } from "./creem/creem.server";

export interface CheckoutResult {
  url: string;
  id: string;
}

export async function createCheckoutForPlan(
  planId: string,
  userId: string,
): Promise<CheckoutResult> {
  const checkout = await createCreemCheckout(planId, userId);
  return {
    url: checkout.checkoutUrl ?? "",
    id: checkout.id,
  };
}
