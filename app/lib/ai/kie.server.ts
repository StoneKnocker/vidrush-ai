import { serverEnv } from "~/lib/env.server";
import { mapKieJobState } from "./kie.shared";
import {
  buildSeedanceInput,
  SEEDANCE_MODEL,
  type SeedanceCreateTaskInput,
} from "./seedance.shared";

const KIE_BASE_URL = "https://api.kie.ai/api/v1";

export interface KieCreateVideoTaskParams {
  model: string;
  callbackUrl: string;
  prompt?: string;
  imageUrls?: string[];
  aspectRatio?: string;
  duration?: string | number;
  size?: string;
}

export interface KieCreateImageTaskParams {
  model: string;
  callbackUrl: string;
  prompt: string;
  inputUrls?: string[];
  imageInput?: string[];
  aspectRatio?: string;
  resolution?: string;
  outputFormat?: string;
}

export interface KieTaskResult {
  taskId: string;
  raw: unknown;
}

interface KieApiResponse {
  code?: number;
  msg?: string;
  data?: {
    taskId?: string;
    state?: string;
    resultJson?: string;
  };
}

function getHeaders() {
  if (!serverEnv.KIE_API_KEY) {
    throw new Error("KIE_API_KEY is required");
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${serverEnv.KIE_API_KEY}`,
  };
}

async function requestKieTask(payload: Record<string, unknown>) {
  const response = await fetch(`${KIE_BASE_URL}/jobs/createTask`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`KIE request failed with status ${response.status}`);
  }

  const body = (await response.json()) as KieApiResponse;
  if (body.code !== 200) {
    throw new Error(`KIE task creation failed: ${body.msg ?? "unknown error"}`);
  }
  if (!body.data?.taskId) {
    throw new Error("KIE task creation failed: missing taskId");
  }

  return {
    taskId: body.data.taskId,
    raw: body.data,
  };
}

export async function createKieVideoTask({
  model,
  callbackUrl,
  prompt,
  imageUrls,
  aspectRatio,
  duration,
  size,
}: KieCreateVideoTaskParams): Promise<KieTaskResult> {
  if (!model) {
    throw new Error("KIE model is required");
  }

  const input: Record<string, unknown> = {
    aspect_ratio: aspectRatio ?? "landscape",
    n_frames: duration ? String(duration) : "10",
    size: size ?? "standard",
  };

  if (prompt) {
    input.prompt = prompt;
  }
  if (imageUrls?.length) {
    input.image_urls = imageUrls;
  }

  return requestKieTask({
    model,
    callBackUrl: callbackUrl,
    input,
  });
}

export async function createKieImageTask({
  model,
  callbackUrl,
  prompt,
  inputUrls,
  imageInput,
  aspectRatio,
  resolution,
  outputFormat,
}: KieCreateImageTaskParams): Promise<KieTaskResult> {
  if (!model) {
    throw new Error("KIE model is required");
  }
  if (!prompt) {
    throw new Error("KIE prompt is required");
  }

  const input: Record<string, unknown> = { prompt };
  if (inputUrls?.length) input.input_urls = inputUrls;
  if (imageInput?.length) input.image_input = imageInput;
  if (aspectRatio) input.aspect_ratio = aspectRatio;
  if (resolution) input.resolution = resolution;
  if (outputFormat) input.output_format = outputFormat;

  return requestKieTask({
    model,
    callBackUrl: callbackUrl,
    input,
  });
}

export async function createKieSeedanceTask({
  callbackUrl,
  input,
}: {
  callbackUrl: string;
  input: SeedanceCreateTaskInput;
}): Promise<KieTaskResult> {
  return requestKieTask({
    model: SEEDANCE_MODEL,
    callBackUrl: callbackUrl,
    input: buildSeedanceInput(input),
  });
}

export async function queryKieJob(taskId: string) {
  const response = await fetch(
    `${KIE_BASE_URL}/jobs/recordInfo?taskId=${encodeURIComponent(taskId)}`,
    {
      method: "GET",
      headers: getHeaders(),
    },
  );

  if (!response.ok) {
    throw new Error(`KIE query failed with status ${response.status}`);
  }

  const body = (await response.json()) as KieApiResponse;
  if (body.code !== 200) {
    throw new Error(`KIE query failed: ${body.msg ?? "unknown error"}`);
  }
  if (!body.data?.state) {
    throw new Error("KIE query failed: missing state");
  }

  return {
    taskId,
    status: mapKieJobState(body.data.state),
    raw: body.data,
  };
}
