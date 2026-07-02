import { randomUUID } from "node:crypto";
import { TASK_STATUS } from "@/lib/consts";
import { db } from "@/lib/database/db.server";
import type { InsertUserTask } from "@/lib/database/schema";
import { userTask } from "@/lib/database/schema";
import { failTask, getTaskById } from "@/lib/model/userTask";
import {
  consumeCredits,
  refundCreditsByTaskId,
} from "@/lib/service/creditsService";

export interface CreateTaskParams {
  userId: string;
  guestId: string;
  guestIp: string;
  prompt: string;
  sourceImages: string[];
  template: string;
  parameters: Record<string, unknown>;
  providerTaskId: string;
  creditCost: number;
}

/**
 * Create a new task and deduct credits.
 *
 * @param params - Task creation parameters
 * @returns Created task ID
 * @throws Error if credit deduction fails or task creation fails
 *
 * Note: Credits are only deducted for logged-in users (when userId is non-empty).
 * Guest users can create tasks without credit deduction.
 */
export async function createTask(params: CreateTaskParams): Promise<string> {
  const {
    userId,
    guestId,
    guestIp,
    prompt,
    sourceImages,
    template,
    parameters,
    providerTaskId,
    creditCost,
  } = params;

  const taskId = randomUUID();

  // Only deduct credits for logged-in users
  if (userId && creditCost > 0) {
    await consumeCredits(userId, creditCost, template, taskId);
  }

  // Create task record
  const taskData: InsertUserTask = {
    id: taskId,
    userId: userId || undefined,
    guestId: guestId || undefined,
    guestIp: guestIp || undefined,
    status: TASK_STATUS.PENDING,
    prompt,
    sourceImages,
    template,
    parameters,
    providerTaskId,
    creditCost,
  };

  await db.insert(userTask).values(taskData);

  return taskId;
}

/**
 * Set task as failed and refund credits.
 *
 * @param taskId - Task ID to fail
 * @param errorMessage - Error message describing why the task failed
 * @throws Error if task not found or refund fails
 */
export async function setTaskFailed(
  taskId: string,
  errorMessage: string,
): Promise<void> {
  const task = await getTaskById(taskId);

  // Update task status to failed
  await failTask(taskId, errorMessage);

  if (task?.userId && task.creditCost > 0) {
    // Refund credits for paid tasks only.
    await refundCreditsByTaskId(taskId, `Task failed: ${errorMessage}`);
  }
}
