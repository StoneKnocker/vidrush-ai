import { env } from "cloudflare:workers";
import { getAutoRiggingCreditCost } from "@/lib/avatarCreditCosts";
import { TASK_STATUS } from "@/lib/consts";
import {
  completeTask,
  getStaleRecoverableTripoTasks,
  getTaskById,
  markTaskPending,
  markTaskProcessing,
  updateTaskProviderState,
} from "@/lib/model/userTask";
import { getServerR2Url, uploadToR2 } from "~/lib/r2/r2.server";
import { consumeCredits } from "~/lib/service/creditsService";
import { setTaskFailed } from "~/lib/service/taskService";

const TRIPO_API_BASE_URL = "https://api.tripo3d.ai/v2/openapi";

export type TripoTaskStatus =
  | "queued"
  | "running"
  | "success"
  | "failed"
  | "banned"
  | "expired"
  | "cancelled"
  | "unknown";

export type TripoModelFormat = "glb" | "fbx";
export type TripoRigType =
  | "biped"
  | "quadruped"
  | "hexapod"
  | "octopod"
  | "avian"
  | "serpentine"
  | "aquatic";
export type TripoRigSpec = "tripo" | "mixamo";
export type TripoAnimationPreset =
  | "preset:idle"
  | "preset:walk"
  | "preset:run"
  | "preset:dive"
  | "preset:climb"
  | "preset:jump"
  | "preset:slash"
  | "preset:shoot"
  | "preset:hurt"
  | "preset:fall"
  | "preset:turn"
  | "preset:quadruped:walk"
  | "preset:hexapod:walk"
  | "preset:octopod:walk"
  | "preset:serpentine:march"
  | "preset:aquatic:march";

const AUTO_RIGGING_MODEL_VERSION = "v2.5-20260210";

export interface CreateTextToModelInput {
  prompt: string;
  texture: boolean;
}

export interface CreateTextToImageInput {
  prompt: string;
  negativePrompt?: string;
}

export type TripoImageFileType = "jpg" | "jpeg" | "png" | "webp";

export interface CreateImageToModelInput {
  imageUrl: string;
  imageType: TripoImageFileType;
  texture: boolean;
}

export type TripoMultiviewSlot = "front" | "left" | "back" | "right";

export interface TripoMultiviewImageInput {
  slot: TripoMultiviewSlot;
  imageUrl: string;
  imageType: TripoImageFileType;
}

export interface CreateMultiviewToModelInput {
  images: TripoMultiviewImageInput[];
  texture: boolean;
}

export interface CreateAnimatePreRigCheckInput {
  originalModelTaskId: string;
}

export interface CreateAnimateRigInput {
  originalModelTaskId: string;
  outFormat: TripoModelFormat;
  rigType?: TripoRigType;
  spec: TripoRigSpec;
}

export interface CreateAnimateRetargetInput {
  originalModelTaskId: string;
  outFormat: TripoModelFormat;
  animations: TripoAnimationPreset[];
  bakeAnimation: boolean;
  exportWithGeometry: boolean;
  animateInPlace: boolean;
}

export type TexturePromptType = "text" | "image" | "images";

export interface TexturePromptText {
  type: "text";
  text: string;
}

export interface TexturePromptImage {
  type: "image";
  image: {
    imageUrl: string;
    imageType: TripoImageFileType;
  };
}

export interface TexturePromptImages {
  type: "images";
  images: {
    front: { imageUrl: string; imageType: TripoImageFileType };
    left?: { imageUrl: string; imageType: TripoImageFileType };
    back?: { imageUrl: string; imageType: TripoImageFileType };
    right?: { imageUrl: string; imageType: TripoImageFileType };
  };
}

export type TexturePrompt =
  | TexturePromptText
  | TexturePromptImage
  | TexturePromptImages;

export interface CreateTextureModelInput {
  originalModelTaskId: string;
  texturePrompt: TexturePrompt;
}

export interface CreateTextToModelResult {
  taskId: string;
}

export interface TripoTaskOutput {
  model?: string;
  base_model?: string;
  pbr_model?: string;
  generated_image?: string;
  rendered_image?: string;
  riggable?: boolean;
  rig_type?: string;
  [key: string]: unknown;
}

export interface TripoTaskData {
  task_id: string;
  type: string;
  status: TripoTaskStatus;
  input?: Record<string, unknown>;
  output?: TripoTaskOutput;
  progress?: number;
  consumed_credit?: number;
  create_time?: number;
  error_code?: number;
  error_msg?: string;
}

interface TripoApiResponse<T> {
  code: number;
  data?: T;
  message?: string;
  suggestion?: string;
}

type LogContext = Record<string, unknown>;

export interface PersistedTripoModel {
  kind: "model" | "base_model" | "pbr_model";
  key: string;
  url: string;
  format: TripoModelFormat;
}

export interface PersistedTripoImage {
  kind: "generated_image" | "rendered_image";
  key: string;
  url: string;
}

export interface TripoTaskResultData {
  images: string[];
  videos: string[];
  models: PersistedTripoModel[];
  tripo: {
    previewModelKey: string;
    downloadModelKey: string;
    renderedImageKey: string;
    generatedImageKey: string;
    providerOutput: TripoTaskOutput;
  };
}

export type TripoStatusResult =
  | {
      state: "success";
      progress: number;
      previewModelUrl: string | null;
      downloadModelUrl: string | null;
      renderedImageUrl: string | null;
      generatedImageUrl: string | null;
      format: TripoModelFormat | null;
      taskId?: string;
    }
  | {
      state: "fail";
      progress: number;
      error: string;
    }
  | {
      state: "deferred";
      progress: number;
      message: string;
    }
  | {
      state: "queued" | "running";
      progress: number;
    };

const TRIPO_RESULT_DEFERRED_MESSAGE =
  "Generation finished. We are saving the files now. Check My Creations later.";

export function getPublicAvatarGenerationError(
  message: string | null | undefined,
  fallback = "Avatar generation failed.",
): string {
  if (!message) {
    return fallback;
  }

  const lowerMessage = message.toLowerCase();
  if (
    lowerMessage.includes("tripo") ||
    lowerMessage.includes("api.tripo3d.ai")
  ) {
    return fallback;
  }

  return message;
}

function buildTripoDeferredStatus(): Extract<
  TripoStatusResult,
  { state: "deferred" }
> {
  return {
    state: "deferred",
    progress: 100,
    message: TRIPO_RESULT_DEFERRED_MESSAGE,
  };
}

function getTraceId(response: Response): string {
  return response.headers.get("X-Tripo-Trace-ID") ?? "";
}

function getSanitizedUrlLogData(url: string) {
  try {
    const parsed = new URL(url);
    return {
      host: parsed.host,
      pathname: parsed.pathname,
      extension: parsed.pathname.split(".").pop()?.toLowerCase() ?? "",
    };
  } catch {
    return {
      host: "",
      pathname: "",
      extension: getExtensionFromUrl(url) ?? "",
    };
  }
}

function getTripoInputLogData(input: Record<string, unknown> | undefined) {
  if (!input) {
    return undefined;
  }

  const file = input.file;
  if (!file || typeof file !== "object") {
    return {
      inputKeys: Object.keys(input),
    };
  }

  const tripoFile = file as {
    type?: unknown;
    url?: unknown;
    file_token?: unknown;
    object?: unknown;
  };

  return {
    inputKeys: Object.keys(input),
    file: {
      type: tripoFile.type,
      hasUrl: typeof tripoFile.url === "string",
      url:
        typeof tripoFile.url === "string"
          ? getSanitizedUrlLogData(tripoFile.url)
          : undefined,
      hasFileToken: typeof tripoFile.file_token === "string",
      hasObject: Boolean(tripoFile.object),
    },
  };
}

function getTripoFilesInputLogData(files: unknown) {
  if (!Array.isArray(files)) {
    return undefined;
  }

  return files.map((file) => {
    if (!file || typeof file !== "object") {
      return {
        empty: true,
      };
    }

    const tripoFile = file as {
      type?: unknown;
      url?: unknown;
      file_token?: unknown;
      object?: unknown;
    };

    return {
      type: tripoFile.type,
      hasUrl: typeof tripoFile.url === "string",
      url:
        typeof tripoFile.url === "string"
          ? getSanitizedUrlLogData(tripoFile.url)
          : undefined,
      hasFileToken: typeof tripoFile.file_token === "string",
      hasObject: Boolean(tripoFile.object),
    };
  });
}

async function requestTripo<T>(
  path: string,
  init: RequestInit,
  context: LogContext = {},
): Promise<T> {
  const method = init.method ?? "GET";
  let response: Response;

  try {
    response = await fetch(`${TRIPO_API_BASE_URL}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${env.TRIPO_API_KEY}`,
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        ...init.headers,
      },
    });
  } catch (error) {
    console.error("Tripo API request failed before response:", {
      path,
      method,
      context,
      error,
    });
    throw new Error(
      "Avatar generation service is temporarily unavailable. Please try again.",
    );
  }

  const traceId = getTraceId(response);
  const data = (await response.json().catch(() => ({
    code: -1,
    message: "Invalid Tripo response",
  }))) as TripoApiResponse<T>;

  if (!response.ok || data.code !== 0 || !data.data) {
    console.error("Tripo API error:", {
      path,
      method,
      status: response.status,
      traceId,
      code: data.code,
      message: data.message,
      suggestion: data.suggestion,
      context,
    });
    throw new Error(
      "Avatar generation service is temporarily unavailable. Please try again.",
    );
  }

  return data.data;
}

export async function createTextToModelTask(
  input: CreateTextToModelInput,
): Promise<CreateTextToModelResult> {
  const data = await requestTripo<{ task_id: string }>("/task", {
    method: "POST",
    body: JSON.stringify({
      type: "text_to_model",
      prompt: input.prompt,
      texture: input.texture,
      pbr: input.texture,
    }),
  });

  return { taskId: data.task_id };
}

export async function createTextToImageTask(
  input: CreateTextToImageInput,
): Promise<CreateTextToModelResult> {
  const context = {
    provider: "tripo",
    mode: "text-to-image",
    taskType: "text_to_image",
    hasNegativePrompt: Boolean(input.negativePrompt),
  };
  const data = await requestTripo<{ task_id: string }>(
    "/task",
    {
      method: "POST",
      body: JSON.stringify({
        type: "text_to_image",
        prompt: input.prompt,
        ...(input.negativePrompt
          ? { negative_prompt: input.negativePrompt }
          : {}),
      }),
    },
    context,
  );

  console.info("Created Tripo text_to_image task:", {
    ...context,
    providerTaskId: data.task_id,
  });

  return { taskId: data.task_id };
}

export async function createImageToModelTask(
  input: CreateImageToModelInput,
): Promise<CreateTextToModelResult> {
  const context = {
    provider: "tripo",
    mode: "image-to-avatar",
    taskType: "image_to_model",
    imageType: input.imageType,
    texture: input.texture,
    pbr: input.texture,
    enableImageAutofix: true,
    renderImage: true,
    imageUrl: getSanitizedUrlLogData(input.imageUrl),
  };

  const data = await requestTripo<{ task_id: string }>(
    "/task",
    {
      method: "POST",
      body: JSON.stringify({
        type: "image_to_model",
        file: {
          type: input.imageType,
          url: input.imageUrl,
        },
        texture: input.texture,
        pbr: input.texture,
        enable_image_autofix: true,
        render_image: true,
      }),
    },
    context,
  );

  console.info("Created Tripo image_to_model task:", {
    ...context,
    providerTaskId: data.task_id,
  });

  return { taskId: data.task_id };
}

export async function createMultiviewToModelTask(
  input: CreateMultiviewToModelInput,
): Promise<CreateTextToModelResult> {
  const bySlot = new Map(
    input.images.map((image) => [image.slot, image] as const),
  );
  const files = (["front", "left", "back", "right"] as const).map((slot) => {
    const image = bySlot.get(slot);
    if (!image) {
      return {};
    }

    return {
      type: image.imageType,
      url: image.imageUrl,
    };
  });
  const context = {
    provider: "tripo",
    mode: "multi-image-to-avatar",
    taskType: "multiview_to_model",
    texture: input.texture,
    pbr: input.texture,
    renderImage: true,
    files: getTripoFilesInputLogData(files),
  };

  const data = await requestTripo<{ task_id: string }>(
    "/task",
    {
      method: "POST",
      body: JSON.stringify({
        type: "multiview_to_model",
        files,
        texture: input.texture,
        pbr: input.texture,
        render_image: true,
      }),
    },
    context,
  );

  console.info("Created Tripo multiview_to_model task:", {
    ...context,
    providerTaskId: data.task_id,
  });

  return { taskId: data.task_id };
}

export async function createAnimatePreRigCheckTask(
  input: CreateAnimatePreRigCheckInput,
): Promise<CreateTextToModelResult> {
  const context = {
    provider: "tripo",
    mode: "auto-rigging",
    taskType: "animate_prerigcheck",
    originalModelTaskId: input.originalModelTaskId,
  };
  const data = await requestTripo<{ task_id: string }>(
    "/task",
    {
      method: "POST",
      body: JSON.stringify({
        type: "animate_prerigcheck",
        original_model_task_id: input.originalModelTaskId,
      }),
    },
    context,
  );

  console.info("Created Tripo animate_prerigcheck task:", {
    ...context,
    providerTaskId: data.task_id,
  });

  return { taskId: data.task_id };
}

export async function createAnimateRigTask(
  input: CreateAnimateRigInput,
): Promise<CreateTextToModelResult> {
  const context = {
    provider: "tripo",
    mode: "auto-rigging",
    taskType: "animate_rig",
    originalModelTaskId: input.originalModelTaskId,
    outFormat: input.outFormat,
    rigType: input.rigType,
    spec: input.spec,
  };
  const data = await requestTripo<{ task_id: string }>(
    "/task",
    {
      method: "POST",
      body: JSON.stringify({
        type: "animate_rig",
        original_model_task_id: input.originalModelTaskId,
        out_format: input.outFormat,
        model_version: AUTO_RIGGING_MODEL_VERSION,
        ...(input.rigType ? { rig_type: input.rigType } : {}),
        spec: input.spec,
      }),
    },
    context,
  );

  console.info("Created Tripo animate_rig task:", {
    ...context,
    providerTaskId: data.task_id,
  });

  return { taskId: data.task_id };
}

export async function createAnimateRetargetTask(
  input: CreateAnimateRetargetInput,
): Promise<CreateTextToModelResult> {
  const context = {
    provider: "tripo",
    mode: "retarget-animation",
    taskType: "animate_retarget",
    originalModelTaskId: input.originalModelTaskId,
    outFormat: input.outFormat,
    animations: input.animations,
    bakeAnimation: input.bakeAnimation,
    exportWithGeometry: input.exportWithGeometry,
    animateInPlace: input.animateInPlace,
  };
  const data = await requestTripo<{ task_id: string }>(
    "/task",
    {
      method: "POST",
      body: JSON.stringify({
        type: "animate_retarget",
        original_model_task_id: input.originalModelTaskId,
        out_format: input.outFormat,
        animations: input.animations,
        bake_animation: input.bakeAnimation,
        export_with_geometry: input.exportWithGeometry,
        animate_in_place: input.animateInPlace,
      }),
    },
    context,
  );

  console.info("Created Tripo animate_retarget task:", {
    ...context,
    providerTaskId: data.task_id,
  });

  return { taskId: data.task_id };
}

export async function createTextureModelTask(
  input: CreateTextureModelInput,
): Promise<CreateTextToModelResult> {
  const texturePrompt = input.texturePrompt;
  let texturePromptPayload: Record<string, unknown>;

  if (texturePrompt.type === "text") {
    texturePromptPayload = { text: texturePrompt.text };
  } else if (texturePrompt.type === "image") {
    texturePromptPayload = {
      image: {
        type: texturePrompt.image.imageType,
        url: texturePrompt.image.imageUrl,
      },
    };
  } else {
    // images type
    const files = [
      {
        type: texturePrompt.images.front.imageType,
        url: texturePrompt.images.front.imageUrl,
      },
      ...(texturePrompt.images.left
        ? [
            {
              type: texturePrompt.images.left.imageType,
              url: texturePrompt.images.left.imageUrl,
            },
          ]
        : [{}]),
      ...(texturePrompt.images.back
        ? [
            {
              type: texturePrompt.images.back.imageType,
              url: texturePrompt.images.back.imageUrl,
            },
          ]
        : [{}]),
      ...(texturePrompt.images.right
        ? [
            {
              type: texturePrompt.images.right.imageType,
              url: texturePrompt.images.right.imageUrl,
            },
          ]
        : [{}]),
    ];
    texturePromptPayload = { images: files };
  }

  const context = {
    provider: "tripo",
    mode: "add-texture",
    taskType: "texture_model",
    originalModelTaskId: input.originalModelTaskId,
    texturePromptType: texturePrompt.type,
  };

  const data = await requestTripo<{ task_id: string }>(
    "/task",
    {
      method: "POST",
      body: JSON.stringify({
        type: "texture_model",
        original_model_task_id: input.originalModelTaskId,
        texture_prompt: texturePromptPayload,
      }),
    },
    context,
  );

  console.info("Created Tripo texture_model task:", {
    ...context,
    providerTaskId: data.task_id,
  });

  return { taskId: data.task_id };
}

export async function queryTripoTaskStatus(
  providerTaskId: string,
): Promise<TripoTaskData> {
  const task = await requestTripo<TripoTaskData>(
    `/task/${providerTaskId}`,
    {
      method: "GET",
    },
    { providerTaskId },
  );

  return task;
}

function normalizeProgress(
  progress: number | undefined,
  status: TripoTaskStatus,
) {
  if (status === "success") {
    return 100;
  }
  if (typeof progress !== "number" || Number.isNaN(progress)) {
    return status === "queued" ? 0 : 1;
  }
  return Math.max(0, Math.min(100, Math.round(progress)));
}

function getExtensionFromUrl(url: string): string | null {
  try {
    const pathname = new URL(url).pathname;
    return pathname.split(".").pop()?.toLowerCase() || null;
  } catch {
    return url.split(".").pop()?.split("?").at(0)?.toLowerCase() || null;
  }
}

function getModelFormat(
  url: string,
  fallback: TripoModelFormat,
): TripoModelFormat {
  const extension = getExtensionFromUrl(url);
  if (extension === "fbx") {
    return "fbx";
  }
  if (extension === "glb" || extension === "gltf") {
    return "glb";
  }
  return fallback;
}

function getContentType(_url: string, response: Response, fallback: string) {
  return response.headers.get("Content-Type") ?? fallback;
}

async function uploadTripoAsset(
  url: string,
  key: string,
  fallbackContentType: string,
): Promise<boolean> {
  try {
    const response = await fetch(url);
    if (response.status !== 200) {
      console.error("Failed to fetch Tripo result:", {
        source: getSanitizedUrlLogData(url),
        key,
        status: response.status,
        statusText: response.statusText,
      });
      return false;
    }

    const uploaded = await uploadToR2(
      await response.arrayBuffer(),
      key,
      getContentType(url, response, fallbackContentType),
    );

    if (!uploaded) {
      console.error("Failed to upload Tripo result to R2:", {
        source: getSanitizedUrlLogData(url),
        key,
        contentType: getContentType(url, response, fallbackContentType),
      });
    }

    return uploaded;
  } catch (error) {
    console.error("Failed to persist Tripo result asset:", {
      source: getSanitizedUrlLogData(url),
      key,
      error,
    });
    return false;
  }
}

async function persistModelAsset(
  taskId: string,
  kind: PersistedTripoModel["kind"],
  url: string | undefined,
  fallbackFormat: TripoModelFormat,
): Promise<PersistedTripoModel | null> {
  if (!url) {
    return null;
  }

  const format = getModelFormat(url, fallbackFormat);
  const key = `tasks/${taskId}-${kind}.${format}`;
  const uploaded = await uploadTripoAsset(
    url,
    key,
    format === "glb" ? "model/gltf-binary" : "application/octet-stream",
  );

  if (!uploaded) {
    return null;
  }

  return {
    kind,
    key,
    url: getServerR2Url(key),
    format,
  };
}

async function persistImageAsset(
  taskId: string,
  kind: PersistedTripoImage["kind"],
  url: string | undefined,
): Promise<PersistedTripoImage | null> {
  if (!url) {
    return null;
  }

  const extension = getExtensionFromUrl(url) ?? "png";
  const key = `tasks/${taskId}-${kind}.${extension}`;
  const uploaded = await uploadTripoAsset(url, key, "image/png");

  if (!uploaded) {
    return null;
  }

  return {
    kind,
    key,
    url: getServerR2Url(key),
  };
}

export function buildTripoSuccessStatus(
  resultData: TripoTaskResultData,
): Extract<TripoStatusResult, { state: "success" }> {
  const previewModel =
    resultData.models.find(
      (model) => model.key === resultData.tripo.previewModelKey,
    ) ?? null;
  const downloadModel =
    resultData.models.find(
      (model) => model.key === resultData.tripo.downloadModelKey,
    ) ?? previewModel;

  return {
    state: "success",
    progress: 100,
    previewModelUrl: previewModel?.url ?? null,
    downloadModelUrl: downloadModel?.url ?? null,
    renderedImageUrl: resultData.tripo.renderedImageKey
      ? getServerR2Url(resultData.tripo.renderedImageKey)
      : null,
    generatedImageUrl: resultData.tripo.generatedImageKey
      ? getServerR2Url(resultData.tripo.generatedImageKey)
      : null,
    format: previewModel?.format ?? null,
  };
}

function getFailureMessage(status: TripoTaskStatus) {
  switch (status) {
    case "banned":
      return "The prompt was blocked by content policy.";
    case "expired":
      return "The generation task expired. Please try generating again.";
    case "cancelled":
      return "The generation task was cancelled.";
    case "unknown":
      return "We could not determine this task status.";
    default:
      return "Avatar generation failed.";
  }
}

function mapAutoRiggingProgress(
  progress: number | undefined,
  status: TripoTaskStatus,
  phase: "prerigcheck" | "rigging" | "retargeting",
) {
  const normalized = normalizeProgress(progress, status);
  if (phase === "prerigcheck") {
    return Math.max(1, Math.min(20, Math.round(normalized * 0.2)));
  }

  if (phase === "rigging") {
    return Math.max(21, Math.min(70, 20 + Math.round(normalized * 0.5)));
  }

  return Math.max(71, Math.min(99, 70 + Math.round(normalized * 0.29)));
}

export async function persistTripoSuccessResult(
  taskId: string,
  task: TripoTaskData,
  fallbackFormat: TripoModelFormat,
): Promise<TripoTaskResultData | null> {
  const output = task.output ?? {};
  const [pbrModel, model, baseModel, renderedImage, generatedImage] =
    await Promise.all([
      persistModelAsset(taskId, "pbr_model", output.pbr_model, fallbackFormat),
      persistModelAsset(taskId, "model", output.model, fallbackFormat),
      persistModelAsset(
        taskId,
        "base_model",
        output.base_model,
        fallbackFormat,
      ),
      persistImageAsset(taskId, "rendered_image", output.rendered_image),
      persistImageAsset(taskId, "generated_image", output.generated_image),
    ]);

  const models = [pbrModel, model, baseModel].filter(
    (item): item is PersistedTripoModel => Boolean(item),
  );
  const images = [renderedImage, generatedImage].filter(
    (item): item is PersistedTripoImage => Boolean(item),
  );
  const previewModel = pbrModel ?? model ?? baseModel ?? null;
  const downloadModel = model ?? pbrModel ?? baseModel ?? null;
  const isImageOnlyTask = task.type === "text_to_image";

  if (!isImageOnlyTask && (!previewModel || !downloadModel)) {
    console.error("Tripo success result did not persist a usable model:", {
      taskId,
      providerTaskId: task.task_id,
      outputKeys: Object.keys(output),
      persistedModels: models.map((item) => ({
        kind: item.kind,
        key: item.key,
        format: item.format,
      })),
      persistedImages: images.map((item) => ({
        kind: item.kind,
        key: item.key,
      })),
    });
    await markTaskPending(taskId, TRIPO_RESULT_DEFERRED_MESSAGE);
    return null;
  }

  if (isImageOnlyTask && images.length === 0) {
    console.error(
      "Tripo text_to_image result did not persist a usable image:",
      {
        taskId,
        providerTaskId: task.task_id,
        outputKeys: Object.keys(output),
      },
    );
    await markTaskPending(taskId, TRIPO_RESULT_DEFERRED_MESSAGE);
    return null;
  }

  const resultData: TripoTaskResultData = {
    images: images.map((image) => image.key),
    videos: [],
    models,
    tripo: {
      previewModelKey: previewModel?.key ?? "",
      downloadModelKey: downloadModel?.key ?? "",
      renderedImageKey: renderedImage?.key ?? "",
      generatedImageKey: generatedImage?.key ?? "",
      providerOutput: output,
    },
  };

  await completeTask(taskId, resultData);
  return resultData;
}

interface AutoRiggingTaskParameters {
  provider?: string;
  mode?: string;
  phase?: "prerigcheck" | "rigging" | "retargeting";
  sourceTaskId?: string;
  originalModelTaskId?: string;
  preRigCheckTaskId?: string;
  rigTaskId?: string;
  retargetTaskId?: string;
  format?: TripoModelFormat;
  rigType?: TripoRigType;
  rigSpec?: TripoRigSpec;
  animation?: TripoAnimationPreset;
  animations?: TripoAnimationPreset[];
  bakeAnimation?: boolean;
  exportWithGeometry?: boolean;
  animateInPlace?: boolean;
  isPublic?: boolean;
}

function isTripoRigType(value: unknown): value is TripoRigType {
  return (
    value === "biped" ||
    value === "quadruped" ||
    value === "hexapod" ||
    value === "octopod" ||
    value === "avian" ||
    value === "serpentine" ||
    value === "aquatic"
  );
}

function getPrerigcheckFailureMessage(task: TripoTaskData) {
  if (task.error_msg) {
    return task.error_msg;
  }

  return "This model cannot be auto-rigged. Try another generated avatar with a clear full body.";
}

function getAutoRiggingAnimations(
  parameters: AutoRiggingTaskParameters,
): TripoAnimationPreset[] {
  if (Array.isArray(parameters.animations)) {
    return parameters.animations;
  }

  return parameters.animation ? [parameters.animation] : [];
}

function getRecoverableAutoRiggingCreditCost(
  task: Awaited<ReturnType<typeof getTaskById>>,
) {
  if (task?.creditCost && task.creditCost > 0) {
    return task.creditCost;
  }

  const parameters = task?.parameters as AutoRiggingTaskParameters | null;
  return getAutoRiggingCreditCost(
    getAutoRiggingAnimations(parameters ?? {}).length,
  );
}

export async function handleTripoAutoRiggingStatusUpdate(
  taskId: string,
  task: TripoTaskData,
  fallbackFormat: TripoModelFormat,
  autoRiggingCreditCost: number,
): Promise<TripoStatusResult> {
  const existingTask = await getTaskById(taskId);
  if (!existingTask) {
    throw new Error("Task not found");
  }

  if (existingTask.status === TASK_STATUS.COMPLETED) {
    return buildTripoSuccessStatus(
      existingTask.resultData as TripoTaskResultData,
    );
  }

  if (existingTask.status === TASK_STATUS.FAILED) {
    return {
      state: "fail",
      progress: 0,
      error: getPublicAvatarGenerationError(
        existingTask.errorMessage,
        "Auto rigging failed.",
      ),
    };
  }

  const parameters = existingTask.parameters as AutoRiggingTaskParameters;
  const phase = parameters.phase ?? "prerigcheck";

  if (phase === "prerigcheck") {
    if (task.status === "queued" || task.status === "running") {
      if (existingTask.status === TASK_STATUS.PENDING) {
        await markTaskProcessing(taskId);
      }

      return {
        state: task.status,
        progress: mapAutoRiggingProgress(task.progress, task.status, phase),
      };
    }

    if (task.status !== "success") {
      const error = getFailureMessage(task.status);
      console.error("Tripo animate_prerigcheck failed:", {
        taskId,
        providerTaskId: task.task_id,
        status: task.status,
        error,
        providerErrorCode: task.error_code,
        providerErrorMessage: task.error_msg,
      });
      await setTaskFailed(taskId, error);
      return {
        state: "fail",
        progress: mapAutoRiggingProgress(task.progress, task.status, phase),
        error,
      };
    }

    if (task.output?.riggable === false) {
      const error = getPrerigcheckFailureMessage(task);
      console.info("Tripo animate_prerigcheck rejected model:", {
        taskId,
        providerTaskId: task.task_id,
        sourceTaskId: parameters.sourceTaskId,
        rigType: task.output.rig_type,
      });
      await setTaskFailed(taskId, error);
      return {
        state: "fail",
        progress: 20,
        error,
      };
    }

    const originalModelTaskId = parameters.originalModelTaskId;
    if (!originalModelTaskId) {
      const error = "Missing source model task for auto rigging.";
      await setTaskFailed(taskId, error);
      return { state: "fail", progress: 20, error };
    }

    let rigProviderTaskId = "";
    try {
      if (existingTask.userId && existingTask.creditCost <= 0) {
        await consumeCredits(
          existingTask.userId,
          autoRiggingCreditCost,
          "Avatar Auto Rigging Task",
          taskId,
        );
        await updateTaskProviderState(taskId, {
          providerTaskId: existingTask.providerTaskId,
          creditCost: autoRiggingCreditCost,
          parameters,
        });
      }

      const detectedRigType = isTripoRigType(task.output?.rig_type)
        ? task.output.rig_type
        : undefined;
      const rigType = parameters.rigType ?? detectedRigType;
      const rigTask = await createAnimateRigTask({
        originalModelTaskId,
        outFormat: fallbackFormat,
        rigType,
        spec: parameters.rigSpec ?? "tripo",
      });
      rigProviderTaskId = rigTask.taskId;

      await updateTaskProviderState(taskId, {
        providerTaskId: rigTask.taskId,
        creditCost: autoRiggingCreditCost,
        parameters: {
          ...parameters,
          phase: "rigging",
          preRigCheckTaskId: task.task_id,
          rigTaskId: rigTask.taskId,
          rigType,
          detectedRigType,
        },
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Auto rigging could not start.";
      console.error("Failed to start Tripo animate_rig task:", {
        taskId,
        preRigCheckTaskId: task.task_id,
        rigProviderTaskId,
        error,
      });
      await setTaskFailed(taskId, message);
      return {
        state: "fail",
        progress: 20,
        error: message,
      };
    }

    return {
      state: "running",
      progress: 25,
    };
  }

  if (task.status === "queued" || task.status === "running") {
    return {
      state: task.status,
      progress: mapAutoRiggingProgress(task.progress, task.status, phase),
    };
  }

  if (phase === "rigging" && task.status === "success") {
    const animations = getAutoRiggingAnimations(parameters);
    if (animations.length === 0) {
      const resultData = await persistTripoSuccessResult(
        taskId,
        task,
        fallbackFormat,
      );
      return resultData
        ? buildTripoSuccessStatus(resultData)
        : buildTripoDeferredStatus();
    }

    let retargetProviderTaskId = "";
    try {
      const retargetTask = await createAnimateRetargetTask({
        originalModelTaskId: task.task_id,
        outFormat: fallbackFormat,
        animations,
        bakeAnimation: parameters.bakeAnimation ?? true,
        exportWithGeometry: parameters.exportWithGeometry ?? true,
        animateInPlace: parameters.animateInPlace ?? false,
      });
      retargetProviderTaskId = retargetTask.taskId;

      await updateTaskProviderState(taskId, {
        providerTaskId: retargetTask.taskId,
        creditCost: autoRiggingCreditCost,
        parameters: {
          ...parameters,
          phase: "retargeting",
          rigTaskId: task.task_id,
          retargetTaskId: retargetTask.taskId,
        },
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Animation retarget could not start.";
      console.error("Failed to start Tripo animate_retarget task:", {
        taskId,
        rigProviderTaskId: task.task_id,
        retargetProviderTaskId,
        error,
      });
      await setTaskFailed(taskId, message);
      return {
        state: "fail",
        progress: 70,
        error: message,
      };
    }

    return {
      state: "running",
      progress: 75,
    };
  }

  if (phase === "retargeting" && task.status === "success") {
    const resultData = await persistTripoSuccessResult(
      taskId,
      task,
      fallbackFormat,
    );
    return resultData
      ? buildTripoSuccessStatus(resultData)
      : buildTripoDeferredStatus();
  }

  const error = getFailureMessage(task.status);
  console.error(
    phase === "retargeting"
      ? "Tripo animate_retarget failed:"
      : "Tripo animate_rig failed:",
    {
      taskId,
      providerTaskId: task.task_id,
      status: task.status,
      error,
      providerErrorCode: task.error_code,
      providerErrorMessage: task.error_msg,
      outputKeys: Object.keys(task.output ?? {}),
    },
  );
  await setTaskFailed(taskId, error);
  return {
    state: "fail",
    progress: mapAutoRiggingProgress(task.progress, task.status, phase),
    error,
  };
}

export async function handleTripoTaskStatusUpdate(
  taskId: string,
  task: TripoTaskData,
  fallbackFormat: TripoModelFormat,
): Promise<TripoStatusResult> {
  const existingTask = await getTaskById(taskId);
  if (!existingTask) {
    throw new Error("Task not found");
  }

  if (existingTask.status === TASK_STATUS.COMPLETED) {
    return buildTripoSuccessStatus(
      existingTask.resultData as TripoTaskResultData,
    );
  }

  if (existingTask.status === TASK_STATUS.FAILED) {
    return {
      state: "fail",
      progress: 0,
      error: getPublicAvatarGenerationError(existingTask.errorMessage),
    };
  }

  const progress = normalizeProgress(task.progress, task.status);

  if (task.status === "success") {
    const resultData = await persistTripoSuccessResult(
      taskId,
      task,
      fallbackFormat,
    );
    return resultData
      ? buildTripoSuccessStatus(resultData)
      : buildTripoDeferredStatus();
  }

  if (task.status === "queued" || task.status === "running") {
    if (existingTask.status === TASK_STATUS.PENDING) {
      await markTaskProcessing(taskId);
    }

    return {
      state: task.status,
      progress,
    };
  }

  const error = getFailureMessage(task.status);
  console.error("Tripo task reached failed final state:", {
    taskId,
    providerTaskId: task.task_id,
    type: task.type,
    status: task.status,
    progress,
    error,
    providerErrorCode: task.error_code,
    providerErrorMessage: task.error_msg,
    input: getTripoInputLogData(task.input),
    outputKeys: Object.keys(task.output ?? {}),
  });
  await setTaskFailed(taskId, error);
  return {
    state: "fail",
    progress,
    error,
  };
}

function getTaskFallbackFormat(task: Awaited<ReturnType<typeof getTaskById>>) {
  const parameters = task?.parameters as { format?: TripoModelFormat } | null;
  return parameters?.format === "fbx" ? "fbx" : "glb";
}

export interface TripoRecoveryResult {
  scanned: number;
  recovered: number;
  pending: number;
  failed: number;
  errored: number;
}

export async function recoverStaleTripoTasks({
  olderThan = new Date(Date.now() - 5 * 60 * 1000),
  limit = 20,
}: {
  olderThan?: Date;
  limit?: number;
} = {}): Promise<TripoRecoveryResult> {
  const tasks = await getStaleRecoverableTripoTasks({ olderThan, limit });
  const result: TripoRecoveryResult = {
    scanned: tasks.length,
    recovered: 0,
    pending: 0,
    failed: 0,
    errored: 0,
  };

  for (const task of tasks) {
    try {
      const parameters = task.parameters as { mode?: string };
      const tripoTask = await queryTripoTaskStatus(task.providerTaskId);
      const status =
        parameters.mode === "auto-rigging"
          ? await handleTripoAutoRiggingStatusUpdate(
              task.id,
              tripoTask,
              getTaskFallbackFormat(task),
              getRecoverableAutoRiggingCreditCost(task),
            )
          : await handleTripoTaskStatusUpdate(
              task.id,
              tripoTask,
              getTaskFallbackFormat(task),
            );

      if (status.state === "success") {
        result.recovered += 1;
      } else if (status.state === "fail") {
        result.failed += 1;
      } else {
        result.pending += 1;
      }
    } catch (error) {
      result.errored += 1;
      console.error("Failed to recover stale Tripo task:", {
        taskId: task.id,
        providerTaskId: task.providerTaskId,
        error,
      });
    }
  }

  return result;
}
