import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createKieSeedanceTask, queryKieJob } from "~/lib/ai/kie.server";
import {
  calculateSeedanceCreditCost,
  SEEDANCE_MODEL,
  seedanceCreateTaskInputSchema,
  seedanceResolutionSchema,
} from "~/lib/ai/seedance.shared";
import { TASK_STATUS } from "~/lib/consts";
import {
  getTaskByIdForUser,
  updateTaskProviderState,
} from "~/lib/model/userTask";
import { getTotalAvailableCredits } from "~/lib/model/userBalance";
import { completeKieTaskFromPayload } from "~/lib/service/kieCallbackService";
import { getPublicEnv } from "~/lib/env.server";
import { createTask, setTaskFailed } from "~/lib/service/taskService";
import { authedProcedure, router } from "./init";

function getKieCallbackUrl() {
  return new URL("/api/ai/kie/callback", getPublicEnv().APP_URL).toString();
}

function isTerminalStatus(status: string) {
  return (
    status === TASK_STATUS.COMPLETED ||
    status === TASK_STATUS.FAILED ||
    status === TASK_STATUS.CANCELED
  );
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
        guestId: ctx.guestId,
        guestIp: ctx.guestIp,
        prompt: input.prompt,
        sourceImages:
          input.mode === "image-to-video"
            ? [input.firstFrameUrl, input.lastFrameUrl].filter(
                (url): url is string => Boolean(url),
              )
            : input.mode === "multi-reference"
              ? (input.referenceImageUrls ?? [])
              : [],
        template: "Seedance 2",
        parameters: {
          provider: "kie",
          model: SEEDANCE_MODEL,
          ...input,
          creditCost,
        },
        providerTaskId: `pending:${crypto.randomUUID()}`,
        creditCost,
      });

      try {
        const providerTask = await createKieSeedanceTask({
          callbackUrl: getKieCallbackUrl(),
          input,
        });

        await updateTaskProviderState(taskId, {
          providerTaskId: providerTask.taskId,
          parameters: {
            provider: "kie",
            model: SEEDANCE_MODEL,
            providerTaskId: providerTask.taskId,
            ...input,
            creditCost,
          },
          creditCost,
        });

        return {
          taskId,
          providerTaskId: providerTask.taskId,
          status: TASK_STATUS.PROCESSING,
          creditCost,
        };
      } catch (error) {
        await setTaskFailed(
          taskId,
          error instanceof Error ? error.message : "video task creation failed",
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

      if (!isTerminalStatus(task.status) && task.providerTaskId) {
        try {
          const providerState = await queryKieJob(task.providerTaskId);
          if (providerState.status === TASK_STATUS.PROCESSING) {
            return {
              taskId: task.id,
              status: TASK_STATUS.PROCESSING,
              resultData: task.resultData,
              errorMessage: task.errorMessage,
            };
          }
          if (providerState.status === TASK_STATUS.COMPLETED) {
            await completeKieTaskFromPayload({
              taskId: task.id,
              body: providerState.raw,
            });
            const completedTask = await getTaskByIdForUser(
              input.taskId,
              ctx.user.id,
            );
            return {
              taskId: task.id,
              status: completedTask?.status ?? TASK_STATUS.COMPLETED,
              resultData: completedTask?.resultData ?? task.resultData,
              errorMessage: completedTask?.errorMessage ?? task.errorMessage,
            };
          }
          if (providerState.status === TASK_STATUS.FAILED) {
            await setTaskFailed(task.id, "video task processing failed");
            return {
              taskId: task.id,
              status: TASK_STATUS.FAILED,
              resultData: task.resultData,
              errorMessage: "video task processing failed",
            };
          }
        } catch (error) {
          console.warn("[video.getTaskStatus] KIE sync failed", error);
        }
      }

      return {
        taskId: task.id,
        status: task.status,
        resultData: task.resultData,
        errorMessage: task.errorMessage,
      };
    }),
});
