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

async function persistKieResults(taskId: string, urls: string[]) {
  const results = [];

  for (const [index, url] of urls.entries()) {
    const extension = getExtensionFromUrl(url);
    const key = `kie/results/${taskId}/${index + 1}${extension}`;
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
    if (payload.resultUrls.length === 0) {
      await setTaskFailed(task.id, "KIE callback did not include result URLs");
      return { status: 200, message: "OK" };
    }

    const results = await persistKieResults(task.id, payload.resultUrls);
    await completeTask(task.id, {
      provider: "kie",
      providerTaskId: payload.taskId,
      results,
    });
  }

  return { status: 200, message: "OK" };
}
