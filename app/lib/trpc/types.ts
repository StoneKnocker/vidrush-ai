import type { TASK_ERROR_CODE } from "~/lib/consts";

export type TaskAction = "pricing" | "login";

export type TaskCreateErrorCode =
  (typeof TASK_ERROR_CODE)[keyof typeof TASK_ERROR_CODE];

export type TaskCreateResult =
  | {
      ok: true;
      taskId: string;
    }
  | {
      ok: false;
      action: TaskAction;
      code: TaskCreateErrorCode;
    };

export type TaskStatusResult =
  | {
      state: "success";
      resultUrls: string[];
    }
  | {
      state: "fail";
      error: string;
    }
  | {
      state: "waiting" | "queuing" | "generating";
    };

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
