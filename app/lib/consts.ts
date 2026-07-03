export const PAYMENT_STATUS = {
  PENDING: "pending",
  PAID: "paid",
  CANCELED: "canceled",
} as const;

//stripe: incomplete, incomplete_expired, trialing, active, past_due, canceled, unpaid, or paused.
export const SUBSCRIPTION_STATUS = {
  PENDING: "pending",
  ACTIVE: "active",
  CANCELED: "canceled",
} as const;

// 'PERMANENT', 'SUBSCRIPTION' (指明动了哪个口袋的钱)
export const CREDIT_TYPE = {
  PERMANENT: "permanent",
  SUBSCRIPTION: "subscription",
} as const;

// type TEXT NOT NULL,                     -- 'PURCHASE', 'SUBSCRIPTION_GRANT', 'SUBSCRIPTION_RESET', 'USAGE', 'REFUND'
export const CREDIT_EVENT = {
  NEW_USER_GRANT: "new_user_grant",
  USAGE: "usage",
  REFUND: "refund",
  PURCHASE: "purchase",
  SUBSCRIPTION_GRANT: "subscription_grant",
  SUBSCRIPTION_RESET: "subscription_reset",
  CHECK_IN_GRANT: "check_in_grant",
  MANUAL_ADJUSTMENT: "manual_adjustment",
} as const;

// PENDING(排队中), PROCESSING(生成中), COMPLETED(成功), FAILED(失败), CANCELLED(取消)
export const TASK_STATUS = {
  PENDING: "pending",
  PROCESSING: "processing",
  COMPLETED: "completed",
  FAILED: "failed",
  CANCELED: "canceled",
} as const;

export const PAYMENT_PROVIDER = {
  CREEM: "creem",
  PAYPAL: "paypal",
} as const;

export type PaymentProvider =
  (typeof PAYMENT_PROVIDER)[keyof typeof PAYMENT_PROVIDER];

// Task error codes for frontend to display appropriate modals
export const TASK_ERROR_CODE = {
  INSUFFICIENT_CREDITS: "INSUFFICIENT_CREDITS",
  GUEST_TASK_EXISTS: "GUEST_TASK_EXISTS",
} as const;

export type TaskErrorCode =
  (typeof TASK_ERROR_CODE)[keyof typeof TASK_ERROR_CODE];
