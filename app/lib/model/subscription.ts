import { and, eq, ne } from "drizzle-orm";
import { db } from "@/lib/database/db.server";
import type { InsertSubscription } from "@/lib/database/schema";
import { subscription } from "@/lib/database/schema";

export async function createSubscription(
  data: Omit<
    InsertSubscription,
    "id" | "createdAt" | "updatedAt" | "publicId"
  > & { publicId?: string },
): Promise<number> {
  const result = await db.insert(subscription).values(data).returning({
    id: subscription.id,
  });

  if (!result[0]) {
    throw new Error("Failed to create subscription");
  }

  return result[0].id;
}

export async function getSubscriptionById(id: number) {
  const result = await db
    .select()
    .from(subscription)
    .where(eq(subscription.id, id));

  return result[0] || null;
}

export async function getSubscriptionByProviderId(
  provider: string,
  providerSubscriptionId: string,
) {
  const result = await db
    .select()
    .from(subscription)
    .where(
      and(
        eq(subscription.provider, provider),
        eq(subscription.providerSubscriptionId, providerSubscriptionId),
      ),
    );

  return result[0] || null;
}

export async function updateSubscriptionPeriod(
  provider: string,
  providerSubscriptionId: string,
  periodStart: Date,
  periodEnd: Date,
) {
  const result = await db
    .update(subscription)
    .set({
      periodStart,
      periodEnd,
    })
    .where(
      and(
        eq(subscription.provider, provider),
        eq(subscription.providerSubscriptionId, providerSubscriptionId),
        ne(subscription.periodEnd, periodEnd),
      ),
    );

  return result.meta.changed_db;
}

export async function updateSubscriptionStatus(
  provider: string,
  providerSubscriptionId: string,
  status: string,
  options: {
    cancelAtPeriodEnd?: boolean;
    canceledAt?: Date | null;
  } = {},
) {
  const result = await db
    .update(subscription)
    .set({
      status,
      ...(options.cancelAtPeriodEnd !== undefined && {
        cancelAtPeriodEnd: options.cancelAtPeriodEnd,
      }),
      ...(options.canceledAt !== undefined && {
        canceledAt: options.canceledAt,
      }),
    })
    .where(
      and(
        eq(subscription.provider, provider),
        eq(subscription.providerSubscriptionId, providerSubscriptionId),
      ),
    );

  return result.meta.changed_db;
}
