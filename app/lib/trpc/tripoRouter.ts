import { env } from "cloudflare:workers";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  AVATAR_CREDIT_COSTS,
  getAutoRiggingCreditCost,
  getImageToAvatarCreditCost,
  getMultiImageToAvatarCreditCost,
  getTextToAvatarCreditCost,
} from "@/lib/avatarCreditCosts";
import { TASK_ERROR_CODE, TASK_STATUS } from "@/lib/consts";
import {
  getCompletedTasksForOwner,
  getTaskById,
  hasGuestCreatedTask,
} from "@/lib/model/userTask";
import { getTotalAvailableCredits } from "~/lib/model/userBalance";
import { createTask } from "~/lib/service/taskService";
import {
  buildTripoSuccessStatus,
  createAnimatePreRigCheckTask,
  createAnimateRetargetTask,
  createImageToModelTask,
  createMultiviewToModelTask,
  createTextToImageTask,
  createTextToModelTask,
  createTextureModelTask,
  getPublicAvatarGenerationError,
  handleTripoAutoRiggingStatusUpdate,
  handleTripoTaskStatusUpdate,
  queryTripoTaskStatus,
  type TripoAnimationPreset,
  type TripoModelFormat,
  type TripoRigSpec,
  type TripoRigType,
  type TripoStatusResult,
  type TripoTaskResultData,
} from "~/lib/service/tripoService";
import { publicProcedure, router } from "./init";
import type { TaskCreateResult } from "./types";

const animationPresetSchema = z.enum([
  "preset:idle",
  "preset:walk",
  "preset:run",
  "preset:dive",
  "preset:climb",
  "preset:jump",
  "preset:slash",
  "preset:shoot",
  "preset:hurt",
  "preset:fall",
  "preset:turn",
  "preset:quadruped:walk",
  "preset:hexapod:walk",
  "preset:octopod:walk",
  "preset:serpentine:march",
  "preset:aquatic:march",
]);

const createTextToAvatarInputSchema = z.object({
  prompt: z.string().trim().min(1).max(1024),
  format: z.enum(["glb", "fbx"]).default("glb"),
  autoTexture: z.boolean().default(true),
  isPublic: z.boolean().default(false),
});

const createTextToImageInputSchema = z.object({
  prompt: z.string().trim().min(1).max(1024),
  negativePrompt: z.string().trim().max(255).optional(),
});

const createImageToAvatarInputSchema = z.object({
  sourceImageUrl: z.string().url(),
  sourceImageType: z.enum(["jpg", "jpeg", "png", "webp"]),
  format: z.enum(["glb", "fbx"]).default("glb"),
  autoTexture: z.boolean().default(true),
  isPublic: z.boolean().default(false),
});

const multiviewImageInputSchema = z.object({
  imageUrl: z.string().url(),
  imageType: z.enum(["jpg", "jpeg", "png", "webp"]),
});

const createMultiImageToAvatarInputSchema = z
  .object({
    images: z.object({
      front: multiviewImageInputSchema,
      left: multiviewImageInputSchema.optional(),
      back: multiviewImageInputSchema.optional(),
      right: multiviewImageInputSchema.optional(),
    }),
    format: z.enum(["glb", "fbx"]).default("glb"),
    autoTexture: z.boolean().default(true),
    isPublic: z.boolean().default(false),
  })
  .superRefine((input, ctx) => {
    const imageCount = [
      input.images.front,
      input.images.left,
      input.images.back,
      input.images.right,
    ].filter(Boolean).length;

    if (imageCount < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["images"],
        message: "Upload front plus at least one left, back, or right image.",
      });
    }
  });

const createAutoRiggingInputSchema = z.object({
  sourceTaskId: z.string().min(1),
  format: z.enum(["glb", "fbx"]).default("glb"),
  isPublic: z.boolean().default(false),
  animations: z
    .array(animationPresetSchema)
    .max(5)
    .refine(
      (animations) => new Set(animations).size === animations.length,
      "Choose each animation at most once.",
    )
    .default([]),
});

const createRetargetAnimationInputSchema = z.object({
  sourceTaskId: z.string().min(1),
  format: z.enum(["glb", "fbx"]).default("glb"),
  animation: animationPresetSchema.default("preset:idle"),
  bakeAnimation: z.boolean().default(true),
  exportWithGeometry: z.boolean().default(true),
  animateInPlace: z.boolean().default(false),
});

const texturePromptTextSchema = z.object({
  type: z.literal("text"),
  text: z.string().trim().min(1).max(600),
});

const texturePromptImageSchema = z.object({
  type: z.literal("image"),
  image: z.object({
    imageUrl: z.string().url(),
    imageType: z.enum(["jpg", "jpeg", "png", "webp"]),
  }),
});

const texturePromptImagesSchema = z
  .object({
    type: z.literal("images"),
    images: z.object({
      front: z.object({
        imageUrl: z.string().url(),
        imageType: z.enum(["jpg", "jpeg", "png", "webp"]),
      }),
      left: z
        .object({
          imageUrl: z.string().url(),
          imageType: z.enum(["jpg", "jpeg", "png", "webp"]),
        })
        .optional(),
      back: z
        .object({
          imageUrl: z.string().url(),
          imageType: z.enum(["jpg", "jpeg", "png", "webp"]),
        })
        .optional(),
      right: z
        .object({
          imageUrl: z.string().url(),
          imageType: z.enum(["jpg", "jpeg", "png", "webp"]),
        })
        .optional(),
    }),
  })
  .superRefine((input, ctx) => {
    const imageCount = [
      input.images.front,
      input.images.left,
      input.images.back,
      input.images.right,
    ].filter(Boolean).length;

    if (imageCount < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["images"],
        message: "Upload front plus at least one left, back, or right image.",
      });
    }
  });

const createTextureModelInputSchema = z.object({
  sourceTaskId: z.string().min(1),
  format: z.enum(["glb", "fbx"]).default("glb"),
  isPublic: z.boolean().default(false),
  texturePrompt: z.union([
    texturePromptTextSchema,
    texturePromptImageSchema,
    texturePromptImagesSchema,
  ]),
});

type RiggingSource = {
  taskId: string;
  prompt: string;
  template: string;
  createdAt: Date | null;
  previewModelUrl: string | null;
  renderedImageUrl: string | null;
  format: TripoModelFormat | null;
};

function isOwnedByContext(
  task: Awaited<ReturnType<typeof getTaskById>>,
  {
    userId,
    guestId,
    guestIp,
  }: {
    userId: string;
    guestId: string;
    guestIp: string;
  },
) {
  if (!task) {
    return false;
  }

  if (userId) {
    return task.userId === userId;
  }

  return (
    (guestId && task.guestId === guestId) ||
    (guestIp && task.guestIp === guestIp)
  );
}

function getTaskMode(task: Awaited<ReturnType<typeof getTaskById>>) {
  return (task?.parameters as { mode?: string } | null)?.mode;
}

function getTaskSourceImages(task: Awaited<ReturnType<typeof getTaskById>>) {
  return Array.isArray(task?.sourceImages)
    ? task.sourceImages.filter(
        (image): image is string => typeof image === "string",
      )
    : [];
}

function getAutoRiggingTaskCreditCost(
  task: Awaited<ReturnType<typeof getTaskById>>,
) {
  if (task?.creditCost && task.creditCost > 0) {
    return task.creditCost;
  }

  const parameters = task?.parameters as {
    animation?: unknown;
    animations?: unknown;
  } | null;
  if (Array.isArray(parameters?.animations)) {
    return getAutoRiggingCreditCost(parameters.animations.length);
  }

  return getAutoRiggingCreditCost(parameters?.animation ? 1 : 0);
}

function getProviderTaskIdForRiggingSource(
  task: Awaited<ReturnType<typeof getTaskById>>,
) {
  if (!task || task.status !== TASK_STATUS.COMPLETED || !task.providerTaskId) {
    return null;
  }

  const mode = getTaskMode(task);
  if (
    mode !== "text-to-avatar" &&
    mode !== "image-to-avatar" &&
    mode !== "multi-image-to-avatar" &&
    mode !== "add-texture"
  ) {
    return null;
  }

  const resultData = task.resultData as TripoTaskResultData | null;
  if (!resultData?.models?.length) {
    return null;
  }

  return task.providerTaskId;
}

function getProviderTaskIdForRetargetSource(
  task: Awaited<ReturnType<typeof getTaskById>>,
) {
  if (!task || task.status !== TASK_STATUS.COMPLETED || !task.providerTaskId) {
    return null;
  }

  if (getTaskMode(task) !== "auto-rigging") {
    return null;
  }

  const resultData = task.resultData as TripoTaskResultData | null;
  if (!resultData?.models?.length) {
    return null;
  }

  return task.providerTaskId;
}

function toRiggingSource(
  task: Awaited<ReturnType<typeof getCompletedTasksForOwner>>[number],
): RiggingSource | null {
  const providerTaskId = getProviderTaskIdForRiggingSource(task);
  if (!providerTaskId) {
    return null;
  }

  const resultData = task.resultData as TripoTaskResultData;
  const status = buildTripoSuccessStatus(resultData);

  return {
    taskId: task.id,
    prompt: task.prompt,
    template: task.template,
    createdAt: task.createdAt,
    previewModelUrl: status.previewModelUrl,
    renderedImageUrl: status.renderedImageUrl,
    format: status.format,
  };
}

export const tripoRouter = router({
  listRiggingSources: publicProcedure.query(async ({ ctx }) => {
    const userId = ctx.user?.id ?? "";
    const { guestId, guestIp } = ctx;
    const tasks = await getCompletedTasksForOwner({
      userId,
      guestId,
      guestIp,
      limit: 50,
    });

    return tasks
      .map(toRiggingSource)
      .filter((item): item is RiggingSource => Boolean(item));
  }),

  createTextToAvatar: publicProcedure
    .input(createTextToAvatarInputSchema)
    .mutation(async ({ ctx, input }): Promise<TaskCreateResult> => {
      const userId = ctx.user?.id ?? "";
      const { guestId, guestIp } = ctx;

      if (userId) {
        const creditCost = getTextToAvatarCreditCost(input.autoTexture);
        const credits = await getTotalAvailableCredits(userId);
        if (credits.total < creditCost) {
          return {
            ok: false,
            action: "pricing",
            code: TASK_ERROR_CODE.INSUFFICIENT_CREDITS,
          };
        }
      } else {
        const hasExistingTask = await hasGuestCreatedTask(guestId, guestIp);
        if (hasExistingTask) {
          return {
            ok: false,
            action: "login",
            code: TASK_ERROR_CODE.GUEST_TASK_EXISTS,
          };
        }
      }

      const creditCost = getTextToAvatarCreditCost(input.autoTexture);
      const providerTaskId =
        String(env.NEED_MOCK) === "1"
          ? "mock-tripo-text-to-avatar-task"
          : (
              await createTextToModelTask({
                prompt: input.prompt,
                texture: input.autoTexture,
              })
            ).taskId;

      const taskId = await createTask({
        userId,
        guestId,
        guestIp,
        prompt: input.prompt,
        sourceImages: [],
        template: "text to avatar",
        parameters: {
          provider: "tripo",
          mode: "text-to-avatar",
          format: input.format,
          autoTexture: input.autoTexture,
          isPublic: input.isPublic,
        },
        providerTaskId,
        creditCost,
      });

      return { ok: true, taskId };
    }),

  createTextToImage: publicProcedure
    .input(createTextToImageInputSchema)
    .mutation(async ({ ctx, input }): Promise<TaskCreateResult> => {
      const userId = ctx.user?.id ?? "";
      const { guestId, guestIp } = ctx;
      const logContext = {
        provider: "tripo",
        mode: "text-to-image",
        userId: userId || undefined,
        guestId: userId ? undefined : guestId,
        hasGuestIp: userId ? undefined : Boolean(guestIp),
        hasNegativePrompt: Boolean(input.negativePrompt),
      };

      if (userId) {
        const credits = await getTotalAvailableCredits(userId);
        if (credits.total < AVATAR_CREDIT_COSTS.textToImage) {
          console.warn("Text-to-image blocked by insufficient credits:", {
            ...logContext,
            availableCredits: credits.total,
            requiredCredits: AVATAR_CREDIT_COSTS.textToImage,
          });
          return {
            ok: false,
            action: "pricing",
            code: TASK_ERROR_CODE.INSUFFICIENT_CREDITS,
          };
        }
      } else {
        const hasExistingTask = await hasGuestCreatedTask(guestId, guestIp);
        if (hasExistingTask) {
          console.warn("Text-to-image blocked by guest task limit:", {
            ...logContext,
          });
          return {
            ok: false,
            action: "login",
            code: TASK_ERROR_CODE.GUEST_TASK_EXISTS,
          };
        }
      }

      let providerTaskId: string;
      try {
        providerTaskId =
          String(env.NEED_MOCK) === "1"
            ? "mock-tripo-text-to-image-task"
            : (
                await createTextToImageTask({
                  prompt: input.prompt,
                  negativePrompt: input.negativePrompt,
                })
              ).taskId;
      } catch (error) {
        console.error("Failed to submit text-to-image provider task:", {
          ...logContext,
          error,
        });
        throw error;
      }

      const taskId = await createTask({
        userId,
        guestId,
        guestIp,
        prompt: input.prompt,
        sourceImages: [],
        template: "text to image",
        parameters: {
          provider: "tripo",
          mode: "text-to-image",
          negativePrompt: input.negativePrompt,
        },
        providerTaskId,
        creditCost: AVATAR_CREDIT_COSTS.textToImage,
      });

      console.info("Created text-to-image app task:", {
        ...logContext,
        taskId,
        providerTaskId,
      });

      return { ok: true, taskId };
    }),

  createImageToAvatar: publicProcedure
    .input(createImageToAvatarInputSchema)
    .mutation(async ({ ctx, input }): Promise<TaskCreateResult> => {
      const userId = ctx.user?.id ?? "";
      const { guestId, guestIp } = ctx;
      const logContext = {
        provider: "tripo",
        mode: "image-to-avatar",
        userId: userId || undefined,
        guestId: userId ? undefined : guestId,
        hasGuestIp: userId ? undefined : Boolean(guestIp),
        sourceImageType: input.sourceImageType,
        autoTexture: input.autoTexture,
        format: input.format,
        isPublic: input.isPublic,
        hasPromptNotes: false,
      };

      if (userId) {
        const creditCost = getImageToAvatarCreditCost(input.autoTexture);
        const credits = await getTotalAvailableCredits(userId);
        if (credits.total < creditCost) {
          console.warn("Image-to-avatar blocked by insufficient credits:", {
            ...logContext,
            availableCredits: credits.total,
            requiredCredits: creditCost,
          });
          return {
            ok: false,
            action: "pricing",
            code: TASK_ERROR_CODE.INSUFFICIENT_CREDITS,
          };
        }
      } else {
        const hasExistingTask = await hasGuestCreatedTask(guestId, guestIp);
        if (hasExistingTask) {
          console.warn("Image-to-avatar blocked by guest task limit:", {
            ...logContext,
          });
          return {
            ok: false,
            action: "login",
            code: TASK_ERROR_CODE.GUEST_TASK_EXISTS,
          };
        }
      }

      let providerTaskId: string;
      try {
        providerTaskId =
          String(env.NEED_MOCK) === "1"
            ? "mock-tripo-image-to-avatar-task"
            : (
                await createImageToModelTask({
                  imageUrl: input.sourceImageUrl,
                  imageType: input.sourceImageType,
                  texture: input.autoTexture,
                })
              ).taskId;
      } catch (error) {
        console.error("Failed to submit image-to-avatar provider task:", {
          ...logContext,
          error,
        });
        throw error;
      }

      const creditCost = getImageToAvatarCreditCost(input.autoTexture);
      const taskId = await createTask({
        userId,
        guestId,
        guestIp,
        prompt: "",
        sourceImages: [input.sourceImageUrl],
        template: "image to avatar",
        parameters: {
          provider: "tripo",
          mode: "image-to-avatar",
          format: input.format,
          autoTexture: input.autoTexture,
          isPublic: input.isPublic,
          sourceImageType: input.sourceImageType,
          enableImageAutofix: true,
        },
        providerTaskId,
        creditCost,
      });

      console.info("Created image-to-avatar app task:", {
        ...logContext,
        taskId,
        providerTaskId,
      });

      return { ok: true, taskId };
    }),

  createMultiImageToAvatar: publicProcedure
    .input(createMultiImageToAvatarInputSchema)
    .mutation(async ({ ctx, input }): Promise<TaskCreateResult> => {
      const userId = ctx.user?.id ?? "";
      const { guestId, guestIp } = ctx;
      const images = [
        { slot: "front" as const, image: input.images.front },
        { slot: "left" as const, image: input.images.left },
        { slot: "back" as const, image: input.images.back },
        { slot: "right" as const, image: input.images.right },
      ].filter(
        (
          item,
        ): item is {
          slot: "front" | "left" | "back" | "right";
          image: {
            imageUrl: string;
            imageType: "jpg" | "jpeg" | "png" | "webp";
          };
        } => Boolean(item.image),
      );
      const logContext = {
        provider: "tripo",
        mode: "multi-image-to-avatar",
        userId: userId || undefined,
        guestId: userId ? undefined : guestId,
        hasGuestIp: userId ? undefined : Boolean(guestIp),
        imageSlots: images.map((item) => item.slot),
        autoTexture: input.autoTexture,
        format: input.format,
        isPublic: input.isPublic,
        hasPromptNotes: false,
      };

      if (userId) {
        const creditCost = getMultiImageToAvatarCreditCost(input.autoTexture);
        const credits = await getTotalAvailableCredits(userId);
        if (credits.total < creditCost) {
          console.warn(
            "Multi-image-to-avatar blocked by insufficient credits:",
            {
              ...logContext,
              availableCredits: credits.total,
              requiredCredits: creditCost,
            },
          );
          return {
            ok: false,
            action: "pricing",
            code: TASK_ERROR_CODE.INSUFFICIENT_CREDITS,
          };
        }
      } else {
        const hasExistingTask = await hasGuestCreatedTask(guestId, guestIp);
        if (hasExistingTask) {
          console.warn("Multi-image-to-avatar blocked by guest task limit:", {
            ...logContext,
          });
          return {
            ok: false,
            action: "login",
            code: TASK_ERROR_CODE.GUEST_TASK_EXISTS,
          };
        }
      }

      let providerTaskId: string;
      try {
        providerTaskId =
          String(env.NEED_MOCK) === "1"
            ? "mock-tripo-multiview-to-avatar-task"
            : (
                await createMultiviewToModelTask({
                  images: images.map((item) => ({
                    slot: item.slot,
                    imageUrl: item.image.imageUrl,
                    imageType: item.image.imageType,
                  })),
                  texture: input.autoTexture,
                })
              ).taskId;
      } catch (error) {
        console.error("Failed to submit multi-image-to-avatar provider task:", {
          ...logContext,
          error,
        });
        throw error;
      }

      const creditCost = getMultiImageToAvatarCreditCost(input.autoTexture);
      const taskId = await createTask({
        userId,
        guestId,
        guestIp,
        prompt: "",
        sourceImages: images.map((item) => item.image.imageUrl),
        template: "multi image to avatar",
        parameters: {
          provider: "tripo",
          mode: "multi-image-to-avatar",
          format: input.format,
          autoTexture: input.autoTexture,
          isPublic: input.isPublic,
          imageSlots: images.map((item) => ({
            slot: item.slot,
            imageType: item.image.imageType,
          })),
          tripoFilesOrder: ["front", "left", "back", "right"],
        },
        providerTaskId,
        creditCost,
      });

      console.info("Created multi-image-to-avatar app task:", {
        ...logContext,
        taskId,
        providerTaskId,
      });

      return { ok: true, taskId };
    }),

  createAutoRigging: publicProcedure
    .input(createAutoRiggingInputSchema)
    .mutation(async ({ ctx, input }): Promise<TaskCreateResult> => {
      const userId = ctx.user?.id ?? "";
      const { guestId, guestIp } = ctx;
      const sourceTask = await getTaskById(input.sourceTaskId);
      const originalModelTaskId = getProviderTaskIdForRiggingSource(sourceTask);
      const logContext = {
        provider: "tripo",
        mode: "auto-rigging",
        userId: userId || undefined,
        guestId: userId ? undefined : guestId,
        hasGuestIp: userId ? undefined : Boolean(guestIp),
        sourceTaskId: input.sourceTaskId,
        originalModelTaskId,
        format: input.format,
        animations: input.animations,
        rigType: "biped",
        rigSpec: "tripo",
      };

      if (
        !sourceTask ||
        !isOwnedByContext(sourceTask, { userId, guestId, guestIp }) ||
        !originalModelTaskId
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Choose a completed generated model before auto rigging.",
        });
      }

      if (userId) {
        const creditCost = getAutoRiggingCreditCost(input.animations.length);
        const credits = await getTotalAvailableCredits(userId);
        if (credits.total < creditCost) {
          console.warn("Auto rigging blocked by insufficient credits:", {
            ...logContext,
            availableCredits: credits.total,
            requiredCredits: creditCost,
          });
          return {
            ok: false,
            action: "pricing",
            code: TASK_ERROR_CODE.INSUFFICIENT_CREDITS,
          };
        }
      } else {
        const hasExistingTask = await hasGuestCreatedTask(guestId, guestIp);
        if (hasExistingTask) {
          return {
            ok: false,
            action: "login",
            code: TASK_ERROR_CODE.GUEST_TASK_EXISTS,
          };
        }
      }

      let providerTaskId: string;
      try {
        providerTaskId =
          String(env.NEED_MOCK) === "1"
            ? "mock-tripo-animate-prerigcheck-task"
            : (
                await createAnimatePreRigCheckTask({
                  originalModelTaskId,
                })
              ).taskId;
      } catch (error) {
        console.error("Failed to submit animate_prerigcheck task:", {
          ...logContext,
          error,
        });
        throw error;
      }

      const taskId = await createTask({
        userId,
        guestId,
        guestIp,
        prompt: sourceTask.prompt,
        sourceImages: getTaskSourceImages(sourceTask),
        template: "auto rigging",
        parameters: {
          provider: "tripo",
          mode: "auto-rigging",
          phase: "prerigcheck",
          sourceTaskId: input.sourceTaskId,
          originalModelTaskId,
          format: input.format,
          animations: input.animations,
          bakeAnimation: true,
          exportWithGeometry: true,
          animateInPlace: false,
          rigType: "biped" satisfies TripoRigType,
          rigSpec: "tripo" satisfies TripoRigSpec,
          isPublic: input.isPublic,
        },
        providerTaskId,
        creditCost: 0,
      });

      console.info("Created auto-rigging app task:", {
        ...logContext,
        taskId,
        providerTaskId,
      });

      return { ok: true, taskId };
    }),

  createRetargetAnimation: publicProcedure
    .input(createRetargetAnimationInputSchema)
    .mutation(async ({ ctx, input }): Promise<TaskCreateResult> => {
      const userId = ctx.user?.id ?? "";
      const { guestId, guestIp } = ctx;
      const sourceTask = await getTaskById(input.sourceTaskId);
      const originalModelTaskId =
        getProviderTaskIdForRetargetSource(sourceTask);
      const logContext = {
        provider: "tripo",
        mode: "retarget-animation",
        userId: userId || undefined,
        guestId: userId ? undefined : guestId,
        hasGuestIp: userId ? undefined : Boolean(guestIp),
        sourceTaskId: input.sourceTaskId,
        originalModelTaskId,
        format: input.format,
        animation: input.animation,
      };

      if (
        !sourceTask ||
        !isOwnedByContext(sourceTask, { userId, guestId, guestIp }) ||
        !originalModelTaskId
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Rig a model before applying an animation.",
        });
      }

      if (userId) {
        const credits = await getTotalAvailableCredits(userId);
        if (credits.total < AVATAR_CREDIT_COSTS.retargetAnimation) {
          console.warn("Animation retarget blocked by insufficient credits:", {
            ...logContext,
            availableCredits: credits.total,
            requiredCredits: AVATAR_CREDIT_COSTS.retargetAnimation,
          });
          return {
            ok: false,
            action: "pricing",
            code: TASK_ERROR_CODE.INSUFFICIENT_CREDITS,
          };
        }
      } else {
        const hasExistingTask = await hasGuestCreatedTask(guestId, guestIp);
        if (hasExistingTask) {
          return {
            ok: false,
            action: "login",
            code: TASK_ERROR_CODE.GUEST_TASK_EXISTS,
          };
        }
      }

      let providerTaskId: string;
      try {
        providerTaskId =
          String(env.NEED_MOCK) === "1"
            ? "mock-tripo-animate-retarget-task"
            : (
                await createAnimateRetargetTask({
                  originalModelTaskId,
                  outFormat: input.format,
                  animations: [input.animation satisfies TripoAnimationPreset],
                  bakeAnimation: input.bakeAnimation,
                  exportWithGeometry: input.exportWithGeometry,
                  animateInPlace: input.animateInPlace,
                })
              ).taskId;
      } catch (error) {
        console.error("Failed to submit animate_retarget task:", {
          ...logContext,
          error,
        });
        throw error;
      }

      const taskId = await createTask({
        userId,
        guestId,
        guestIp,
        prompt: sourceTask.prompt,
        sourceImages: getTaskSourceImages(sourceTask),
        template: "animation retarget",
        parameters: {
          provider: "tripo",
          mode: "retarget-animation",
          sourceTaskId: input.sourceTaskId,
          originalModelTaskId,
          format: input.format,
          animation: input.animation,
          bakeAnimation: input.bakeAnimation,
          exportWithGeometry: input.exportWithGeometry,
          animateInPlace: input.animateInPlace,
        },
        providerTaskId,
        creditCost: AVATAR_CREDIT_COSTS.retargetAnimation,
      });

      console.info("Created animation-retarget app task:", {
        ...logContext,
        taskId,
        providerTaskId,
      });

      return { ok: true, taskId };
    }),

  createTextureModel: publicProcedure
    .input(createTextureModelInputSchema)
    .mutation(async ({ ctx, input }): Promise<TaskCreateResult> => {
      const userId = ctx.user?.id ?? "";
      const { guestId, guestIp } = ctx;
      const sourceTask = await getTaskById(input.sourceTaskId);
      const originalModelTaskId = getProviderTaskIdForRiggingSource(sourceTask);
      const logContext = {
        provider: "tripo",
        mode: "add-texture",
        userId: userId || undefined,
        guestId: userId ? undefined : guestId,
        hasGuestIp: userId ? undefined : Boolean(guestIp),
        sourceTaskId: input.sourceTaskId,
        originalModelTaskId,
        format: input.format,
        texturePromptType: input.texturePrompt.type,
      };

      if (
        !sourceTask ||
        !isOwnedByContext(sourceTask, { userId, guestId, guestIp }) ||
        !originalModelTaskId
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Choose a completed generated model before adding texture.",
        });
      }

      if (userId) {
        const credits = await getTotalAvailableCredits(userId);
        if (credits.total < AVATAR_CREDIT_COSTS.addTexture) {
          console.warn("Add texture blocked by insufficient credits:", {
            ...logContext,
            availableCredits: credits.total,
            requiredCredits: AVATAR_CREDIT_COSTS.addTexture,
          });
          return {
            ok: false,
            action: "pricing",
            code: TASK_ERROR_CODE.INSUFFICIENT_CREDITS,
          };
        }
      } else {
        const hasExistingTask = await hasGuestCreatedTask(guestId, guestIp);
        if (hasExistingTask) {
          return {
            ok: false,
            action: "login",
            code: TASK_ERROR_CODE.GUEST_TASK_EXISTS,
          };
        }
      }

      let texturePromptForService: Parameters<
        typeof createTextureModelTask
      >[0]["texturePrompt"];
      if (input.texturePrompt.type === "text") {
        texturePromptForService = {
          type: "text",
          text: input.texturePrompt.text,
        };
      } else if (input.texturePrompt.type === "image") {
        texturePromptForService = {
          type: "image",
          image: {
            imageUrl: input.texturePrompt.image.imageUrl,
            imageType: input.texturePrompt.image.imageType,
          },
        };
      } else {
        texturePromptForService = {
          type: "images",
          images: {
            front: {
              imageUrl: input.texturePrompt.images.front.imageUrl,
              imageType: input.texturePrompt.images.front.imageType,
            },
            ...(input.texturePrompt.images.left
              ? {
                  left: {
                    imageUrl: input.texturePrompt.images.left.imageUrl,
                    imageType: input.texturePrompt.images.left.imageType,
                  },
                }
              : {}),
            ...(input.texturePrompt.images.back
              ? {
                  back: {
                    imageUrl: input.texturePrompt.images.back.imageUrl,
                    imageType: input.texturePrompt.images.back.imageType,
                  },
                }
              : {}),
            ...(input.texturePrompt.images.right
              ? {
                  right: {
                    imageUrl: input.texturePrompt.images.right.imageUrl,
                    imageType: input.texturePrompt.images.right.imageType,
                  },
                }
              : {}),
          },
        };
      }

      let providerTaskId: string;
      try {
        providerTaskId =
          String(env.NEED_MOCK) === "1"
            ? "mock-tripo-texture-model-task"
            : (
                await createTextureModelTask({
                  originalModelTaskId,
                  texturePrompt: texturePromptForService,
                })
              ).taskId;
      } catch (error) {
        console.error("Failed to submit texture_model task:", {
          ...logContext,
          error,
        });
        throw error;
      }

      const taskId = await createTask({
        userId,
        guestId,
        guestIp,
        prompt: sourceTask.prompt,
        sourceImages: getTaskSourceImages(sourceTask),
        template: "add texture",
        parameters: {
          provider: "tripo",
          mode: "add-texture",
          sourceTaskId: input.sourceTaskId,
          originalModelTaskId,
          texturePromptType: input.texturePrompt.type,
          format: input.format,
          isPublic: input.isPublic,
        },
        providerTaskId,
        creditCost: AVATAR_CREDIT_COSTS.addTexture,
      });

      console.info("Created add-texture app task:", {
        ...logContext,
        taskId,
        providerTaskId,
      });

      return { ok: true, taskId };
    }),

  queryStatus: publicProcedure
    .input(z.object({ taskId: z.string() }))
    .query(async ({ input }): Promise<TripoStatusResult> => {
      const task = await getTaskById(input.taskId);

      if (!task) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Task not found",
        });
      }

      const parameters = task.parameters as {
        format?: TripoModelFormat;
        mode?: string;
        provider?: string;
      };
      const fallbackFormat = parameters.format === "fbx" ? "fbx" : "glb";
      if (task.status === TASK_STATUS.COMPLETED) {
        return {
          ...buildTripoSuccessStatus(task.resultData as TripoTaskResultData),
          taskId: input.taskId,
        };
      }

      if (task.status === TASK_STATUS.FAILED) {
        console.warn("Returning cached failed Tripo task:", {
          taskId: input.taskId,
          providerTaskId: task.providerTaskId,
          provider: parameters.provider,
          mode: parameters.mode,
          appStatus: task.status,
          errorMessage: task.errorMessage,
        });
        return {
          state: "fail",
          progress: 0,
          error: getPublicAvatarGenerationError(task.errorMessage),
        };
      }

      if (String(env.NEED_MOCK) === "1") {
        return {
          state: "running",
          progress: 35,
        };
      }

      const tripoTask = await queryTripoTaskStatus(task.providerTaskId);
      const status =
        parameters.mode === "auto-rigging"
          ? await handleTripoAutoRiggingStatusUpdate(
              input.taskId,
              tripoTask,
              fallbackFormat,
              getAutoRiggingTaskCreditCost(task),
            )
          : await handleTripoTaskStatusUpdate(
              input.taskId,
              tripoTask,
              fallbackFormat,
            );

      return status.state === "success"
        ? { ...status, taskId: input.taskId }
        : status;
    }),
});
