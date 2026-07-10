export interface CheckoutCreateResult {
  checkoutUrl: string;
  checkoutId: string;
  publicId?: string;
}

export type PaymentStatusState = "pending" | "paid" | "canceled" | "not_found";

export interface PaymentStatusResult {
  status: PaymentStatusState;
  amount?: number;
  currency?: string;
  creditsAmount?: number;
  creditType?: string;
  planId?: string;
  provider?: string;
}
