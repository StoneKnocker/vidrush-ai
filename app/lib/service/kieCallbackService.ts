import { extname } from "node:path";
import { TASK_STATUS } from "~/lib/consts";
import {
  completeTask,
  getTaskByProviderTaskId,
  markTaskProcessing,
} from "~/lib/model/userTask";
import { downloadAndUpload, getServerR2Url } from "~/lib/r2/r2.server";
import { setTaskFailed } from "~/lib/service/taskService";
import {
  extractKieCallbackPayload,
  mapKieJobState,
  verifyKieWebhookSignature,
} from "../ai/kie.shared";
import { parseKieSeedanceResult } from "../ai/seedance.shared";
import { serverEnv } from "../env.server";

export interface HandleKieCallbackParams {
  body: unknown;
  timestamp: string | null;
  signature: string | null;
}

export interface HandleKieCallbackResult {
  status: number;
  message: string;
}

function isTerminalStatus(status: string) {
  return (
    status === TASK_STATUS.COMPLETED ||
    status === TASK_STATUS.FAILED ||
    status === TASK_STATUS.CANCELED
  );
}

function getExtensionFromUrl(url: string) {
  try {
    const pathname = new URL(url).pathname;
    const extension = extname(pathname).toLowerCase();
    return extension || ".bin";
  } catch {
    return ".bin";
  }
}

function getContentTypeFromExtension(extension: string) {
  switch (extension) {
    case ".mp4":
      return "video/mp4";
    case ".webm":
      return "video/webm";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".webp":
      return "image/webp";
    case ".png":
      return "image/png";
    default:
      return "application/octet-stream";
  }
}

async function persistKieResults(taskId: string, urls: string[], offset = 0) {
  const results = [];

  for (const [index, url] of urls.entries()) {
    const extension = getExtensionFromUrl(url);
    const key = `kie/results/${taskId}/${offset + index + 1}${extension}`;
    const uploaded = await downloadAndUpload(url, key);
    results.push({
      url: uploaded ? getServerR2Url(key) : url,
      sourceUrl: url,
      key: uploaded ? key : undefined,
      contentType: getContentTypeFromExtension(extension),
    });
  }

  return results;
}

function buildResultData(media: Awaited<ReturnType<typeof persistKieResults>>) {
  const videos: string[] = [];
  const images: string[] = [];

  for (const item of media) {
    const keyOrUrl = item.key ?? item.url;
    if (item.contentType.startsWith("video/")) {
      videos.push(keyOrUrl);
    } else if (item.contentType.startsWith("image/")) {
      images.push(keyOrUrl);
    }
  }

  return { images, videos };
}

function getSeedanceResultPayload(body: unknown): Record<string, unknown> {
  if (!body || typeof body !== "object") {
    return {};
  }

  if ("data" in body) {
    return (body as { data?: Record<string, unknown> }).data ?? {};
  }

  return body as Record<string, unknown>;
}

export async function completeKieTaskFromPayload({
  taskId,
  body,
  fallbackResultUrls,
}: {
  taskId: string;
  body: unknown;
  fallbackResultUrls?: string[];
}) {
  const seedanceResult = parseKieSeedanceResult(getSeedanceResultPayload(body));
  const resultUrls =
    seedanceResult.resultUrls.length > 0
      ? seedanceResult.resultUrls
      : (fallbackResultUrls ?? []);

  if (resultUrls.length === 0) {
    await setTaskFailed(taskId, "KIE callback did not include result URLs");
    return;
  }

  const results = await persistKieResults(taskId, resultUrls);
  const frames = [
    ...seedanceResult.firstFrameUrls,
    ...seedanceResult.lastFrameUrls,
  ];
  const persistedFrames =
    frames.length > 0
      ? await persistKieResults(taskId, frames, results.length)
      : [];
  await completeTask(taskId, buildResultData([...results, ...persistedFrames]));
}

export async function handleKieCallback({
  body,
  timestamp,
  signature,
}: HandleKieCallbackParams): Promise<HandleKieCallbackResult> {
  const isAuthorized = await verifyKieWebhookSignature({
    payload: body,
    timestamp,
    signature,
    secret: serverEnv.KIE_WEBHOOK_HMAC_KEY,
  });

  if (!isAuthorized) {
    return { status: 401, message: "Unauthorized" };
  }

  const payload = extractKieCallbackPayload(body);
  const task = await getTaskByProviderTaskId(payload.taskId);

  if (!task) {
    console.warn("[kie-callback] Unknown KIE task", {
      providerTaskId: payload.taskId,
    });
    return { status: 200, message: "OK" };
  }

  if (isTerminalStatus(task.status)) {
    return { status: 200, message: "OK" };
  }

  const localStatus = mapKieJobState(payload.state);
  if (localStatus === TASK_STATUS.PROCESSING) {
    await markTaskProcessing(task.id);
    return { status: 200, message: "OK" };
  }

  if (localStatus === TASK_STATUS.FAILED) {
    await setTaskFailed(
      task.id,
      payload.failMessage ?? "KIE task processing failed",
    );
    return { status: 200, message: "OK" };
  }

  if (localStatus === TASK_STATUS.COMPLETED) {
    await completeKieTaskFromPayload({
      taskId: task.id,
      body,
      fallbackResultUrls: payload.resultUrls,
    });
  }

  return { status: 200, message: "OK" };
}
