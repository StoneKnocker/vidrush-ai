import { eq } from "drizzle-orm";
import { db } from "@/lib/database/db.server";
import type { InsertPayment } from "@/lib/database/schema";
import { payment } from "@/lib/database/schema";

export async function createPayment(
  data: Omit<InsertPayment, "id" | "createdAt" | "updatedAt">,
): Promise<{ id: number; publicId: string }> {
  const result = await db.insert(payment).values(data).returning({
    id: payment.id,
    publicId: payment.publicId,
  });

  if (!result[0]) {
    throw new Error("Failed to create payment");
  }

  return result[0];
}

export async function getPaymentById(id: number) {
  const result = await db.select().from(payment).where(eq(payment.id, id));

  return result[0] || null;
}

export async function getPaymentByPublicId(publicId: string) {
  const result = await db
    .select()
    .from(payment)
    .where(eq(payment.publicId, publicId));

  return result[0] || null;
}

export async function updatePaymentStatus(
  id: number,
  status: string,
  providerSessionId?: string,
) {
  await db
    .update(payment)
    .set({
      status,
      ...(providerSessionId && { providerSessionId }),
    })
    .where(eq(payment.id, id));
}

export async function updatePaymentSessionId(
  id: number,
  providerSessionId: string,
) {
  await db
    .update(payment)
    .set({
      providerSessionId,
    })
    .where(eq(payment.id, id));
}

export async function getPaymentBySessionId(checkoutId: string) {
  const result = await db
    .select()
    .from(payment)
    .where(eq(payment.providerSessionId, checkoutId));

  return result[0] || null;
}
