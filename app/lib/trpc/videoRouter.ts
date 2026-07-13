import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createKieSeedanceTask, queryKieJob } from "~/lib/ai/kie.server";
import {
  calculateSeedanceCreditCost,
  getTaskResultMedia,
  SEEDANCE_MODEL,
  seedanceCreateTaskInputSchema,
  seedanceResolutionSchema,
} from "~/lib/ai/seedance.shared";
import { TASK_STATUS } from "~/lib/consts";
import { serverEnv } from "~/lib/env.server";
import {
  getTaskByIdForUser,
  isTaskTerminal,
  markTaskSubmitted,
  touchTaskUpdatedAt,
} from "~/lib/model/userTask";
import { getTotalAvailableCredits } from "~/lib/model/userBalance";
import { applyKieJobToTask } from "~/lib/service/kieCallbackService";
import { createTask, setTaskFailed } from "~/lib/service/taskService";
import { authedProcedure, router } from "./init";

/** Provider accepted the job but local task was already terminalized (recovery race). */
class TaskSubmissionAbortedError extends Error {
  readonly providerTaskId: string;

  constructor(taskId: string, providerTaskId: string) {
    super("video task submission aborted");
    this.name = "TaskSubmissionAbortedError";
    this.providerTaskId = providerTaskId;
    this.cause = { taskId, providerTaskId };
  }
}

/** Dev may set KIE_CALLBACK_BASE_URL (ngrok); prod leaves it unset → APP_URL. */
function getKieCallbackUrl() {
  const baseUrl = serverEnv.KIE_CALLBACK_BASE_URL ?? serverEnv.APP_URL;
  return new URL("/api/ai/kie/callback", baseUrl).toString();
}

function toTaskStatusResponse(task: {
  id: string;
  status: string;
  mode: string;
  resultData: unknown;
  errorMessage: string;
}) {
  const media = getTaskResultMedia(task.resultData);
  return {
    taskId: task.id,
    status: task.status,
    mode: task.mode,
    resultData: task.resultData,
    videoKeys: media.videoKeys,
    posterKey: media.posterKey,
    errorMessage: task.errorMessage,
  };
}

export const videoRouter = router({
  getCreditsForSettings: authedProcedure
    .input(
      z.object({
        resolution: seedanceResolutionSchema,
        generateAudio: z.boolean(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const credits = await getTotalAvailableCredits(ctx.user.id);
      const creditCost = calculateSeedanceCreditCost(
        input.resolution,
        input.generateAudio,
      );

      return {
        creditCost,
        balance: credits.total,
        hasEnoughCredits: credits.total >= creditCost,
      };
    }),

  createSeedanceTask: authedProcedure
    .input(seedanceCreateTaskInputSchema)
    .mutation(async ({ ctx, input }) => {
      const creditCost = calculateSeedanceCreditCost(
        input.resolution,
        input.generateAudio,
      );
      const credits = await getTotalAvailableCredits(ctx.user.id);

      if (credits.total < creditCost) {
        throw new TRPCError({
          code: "PAYMENT_REQUIRED",
          message: "Insufficient credits",
        });
      }

      const taskId = await createTask({
        userId: ctx.user.id,
        mode: input.mode,
        model: SEEDANCE_MODEL,
        provider: "kie",
        prompt: input.prompt,
        input,
        creditCost,
      });

      try {
        // Lease: refresh updatedAt so recovery won't fail+refund mid-create.
        const leased = await touchTaskUpdatedAt(taskId);
        if (!leased) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "video task is no longer active",
          });
        }

        const providerTask = await createKieSeedanceTask({
          callbackUrl: getKieCallbackUrl(),
          input,
        });

        const submitted = await markTaskSubmitted(taskId, providerTask.taskId);
        if (!submitted) {
          // Recovery (or another path) already terminalized the task while
          // provider create was in flight — do not resurrect a refunded task.
          // Provider job may be orphaned; lease keeps this path rare.
          console.error(
            "[video.createSeedanceTask] markTaskSubmitted aborted (task already terminal or submitted)",
            { taskId, providerTaskId: providerTask.taskId },
          );
          throw new TaskSubmissionAbortedError(taskId, providerTask.taskId);
        }

        return {
          taskId,
          providerTaskId: providerTask.taskId,
          status: TASK_STATUS.PROCESSING,
          creditCost,
        };
      } catch (error) {
        if (error instanceof TaskSubmissionAbortedError) {
          throw new TRPCError({
            code: "CONFLICT",
            message: error.message,
          });
        }
        if (error instanceof TRPCError) {
          throw error;
        }
        await setTaskFailed(
          taskId,
          error instanceof Error ? error.message : "video task creation failed",
          "provider_create_failed",
        );
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "video task creation failed",
        });
      }
    }),

  getTaskStatus: authedProcedure
    .input(z.object({ taskId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const task = await getTaskByIdForUser(input.taskId, ctx.user.id);

      if (!task) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Task not found" });
      }

      if (!isTaskTerminal(task.status) && task.providerTaskId) {
        try {
          const providerState = await queryKieJob(task.providerTaskId);
          await applyKieJobToTask({
            taskId: task.id,
            body: providerState.raw,
          });
          const refreshed = await getTaskByIdForUser(input.taskId, ctx.user.id);
          if (refreshed) {
            return toTaskStatusResponse(refreshed);
          }
        } catch (error) {
          console.warn("[video.getTaskStatus] KIE sync failed", error);
        }
      }

      return toTaskStatusResponse(task);
    }),
});
