import { and, desc, eq, like, sql } from "drizzle-orm";
import { TASK_STATUS } from "@/lib/consts";
import { db } from "@/lib/database/db.server";
import type { SelectUserTask } from "@/lib/database/schema";
import { user, userTask } from "@/lib/database/schema";

export async function getTaskById(id: string) {
  const result = await db.select().from(userTask).where(eq(userTask.id, id));
  return result[0] || null;
}

export async function getTaskByIdForUser(id: string, userId: string) {
  const result = await db
    .select()
    .from(userTask)
    .where(and(eq(userTask.id, id), eq(userTask.userId, userId)));
  return result[0] || null;
}

export async function completeTask(
  id: string,
  resultData: SelectUserTask["resultData"],
) {
  await db
    .update(userTask)
    .set({
      status: TASK_STATUS.COMPLETED,
      resultData,
      errorMessage: "",
      completedAt: new Date(),
    })
    .where(eq(userTask.id, id));
}

export async function markTaskProcessing(id: string) {
  await db
    .update(userTask)
    .set({
      status: TASK_STATUS.PROCESSING,
    })
    .where(eq(userTask.id, id));
}

export async function updateTaskProviderState(
  id: string,
  data: {
    providerTaskId: string;
    parameters: SelectUserTask["parameters"];
    creditCost?: number;
  },
) {
  await db
    .update(userTask)
    .set({
      status: TASK_STATUS.PROCESSING,
      providerTaskId: data.providerTaskId,
      parameters: data.parameters,
      ...(typeof data.creditCost === "number"
        ? { creditCost: data.creditCost }
        : {}),
    })
    .where(eq(userTask.id, id));
}

export async function failTask(id: string, errorMessage: string) {
  await db
    .update(userTask)
    .set({
      status: TASK_STATUS.FAILED,
      errorMessage,
      completedAt: new Date(),
    })
    .where(eq(userTask.id, id));
}

export async function getTaskByProviderTaskId(providerTaskId: string) {
  const result = await db
    .select()
    .from(userTask)
    .where(eq(userTask.providerTaskId, providerTaskId));
  return result[0] || null;
}

export async function getAllUserTasksPaginated(
  page: number,
  pageSize: number,
  filters?: { userId?: string; emailPrefix?: string },
) {
  const offset = (page - 1) * pageSize;
  const conditions = [];

  if (filters?.userId) {
    conditions.push(eq(userTask.userId, filters.userId));
  }
  if (filters?.emailPrefix) {
    conditions.push(like(user.email, `${filters.emailPrefix}%`));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [items, countResult] = await Promise.all([
    db
      .select({
        id: userTask.id,
        userId: userTask.userId,
        guestId: userTask.guestId,
        guestIp: userTask.guestIp,
        status: userTask.status,
        prompt: userTask.prompt,
        template: userTask.template,
        parameters: userTask.parameters,
        resultData: userTask.resultData,
        errorMessage: userTask.errorMessage,
        creditCost: userTask.creditCost,
        createdAt: userTask.createdAt,
        completedAt: userTask.completedAt,
        userName: user.name,
        userEmail: user.email,
      })
      .from(userTask)
      .leftJoin(user, eq(userTask.userId, user.id))
      .where(whereClause)
      .orderBy(desc(userTask.createdAt))
      .limit(pageSize)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)` })
      .from(userTask)
      .leftJoin(user, eq(userTask.userId, user.id))
      .where(whereClause),
  ]);

  const total = countResult[0]?.count ?? 0;

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getUsersWithTasks() {
  const result = await db
    .selectDistinct({
      userId: userTask.userId,
      name: user.name,
      email: user.email,
    })
    .from(userTask)
    .innerJoin(user, eq(userTask.userId, user.id))
    .where(sql`${userTask.userId} IS NOT NULL`);

  return result.filter(
    (r): r is { userId: string; name: string; email: string } =>
      r.userId !== null,
  );
}

export async function getUserCompletedTasksPaginated(
  userId: string,
  page: number,
  pageSize: number,
) {
  const offset = (page - 1) * pageSize;

  const [items, countResult] = await Promise.all([
    db
      .select({
        id: userTask.id,
        template: userTask.template,
        resultData: userTask.resultData,
        createdAt: userTask.createdAt,
      })
      .from(userTask)
      .where(
        and(
          eq(userTask.userId, userId),
          eq(userTask.status, TASK_STATUS.COMPLETED),
        ),
      )
      .orderBy(desc(userTask.createdAt))
      .limit(pageSize)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)` })
      .from(userTask)
      .where(
        and(
          eq(userTask.userId, userId),
          eq(userTask.status, TASK_STATUS.COMPLETED),
        ),
      ),
  ]);

  const total = countResult[0]?.count ?? 0;

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}
