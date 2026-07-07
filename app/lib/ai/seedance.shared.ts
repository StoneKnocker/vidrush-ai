import { z } from "zod";

export const SEEDANCE_MODEL = "bytedance/seedance-2";

export const seedanceModeSchema = z.enum([
  "text-to-video",
  "image-to-video",
  "multi-reference",
]);

export const seedanceResolutionSchema = z.enum(["480p", "720p", "1080p", "4k"]);

export const seedanceAspectRatioSchema = z.enum([
  "adaptive",
  "16:9",
  "9:16",
  "4:3",
  "3:4",
  "21:9",
  "1:1",
]);

const urlSchema = z.string().url();

const seedanceBaseInputSchema = z.object({
  mode: seedanceModeSchema,
  prompt: z.string().trim().min(3).max(20_000),
  resolution: seedanceResolutionSchema,
  aspectRatio: seedanceAspectRatioSchema,
  duration: z.number().int().min(4).max(15),
  generateAudio: z.boolean(),
  webSearch: z.boolean().optional(),
  nsfwChecker: z.boolean().optional(),
});

export const seedanceCreateTaskInputSchema = z.discriminatedUnion("mode", [
  seedanceBaseInputSchema.extend({
    mode: z.literal("text-to-video"),
  }),
  seedanceBaseInputSchema.extend({
    mode: z.literal("image-to-video"),
    firstFrameUrl: urlSchema,
    lastFrameUrl: urlSchema.optional(),
  }),
  seedanceBaseInputSchema.extend({
    mode: z.literal("multi-reference"),
    referenceImageUrls: z.array(urlSchema).max(9).optional(),
    referenceVideoUrls: z.array(urlSchema).max(3).optional(),
    referenceAudioUrls: z.array(urlSchema).max(3).optional(),
  }),
]);

export type SeedanceCreateTaskInput = z.infer<
  typeof seedanceCreateTaskInputSchema
>;

export interface SeedanceKieInput {
  prompt: string;
  first_frame_url?: string;
  last_frame_url?: string;
  reference_image_urls?: string[];
  reference_video_urls?: string[];
  reference_audio_urls?: string[];
  generate_audio: boolean;
  resolution: "480p" | "720p" | "1080p" | "4k";
  aspect_ratio: "adaptive" | "16:9" | "9:16" | "4:3" | "3:4" | "21:9" | "1:1";
  duration: number;
  web_search: boolean;
  nsfw_checker: boolean;
}

export interface ParsedSeedanceResult {
  resultUrls: string[];
  firstFrameUrls: string[];
  lastFrameUrls: string[];
}

const CREDIT_COST_BY_RESOLUTION: Record<
  SeedanceCreateTaskInput["resolution"],
  number
> = {
  "480p": 10,
  "720p": 20,
  "1080p": 40,
  "4k": 80,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function stringArray(value: unknown): string[] {
  if (typeof value === "string" && value.length > 0) {
    return [value];
  }
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter(
    (item): item is string => typeof item === "string" && item.length > 0,
  );
}

function parseResultJson(payload: Record<string, unknown>) {
  const { resultJson } = payload;
  if (!resultJson) {
    return {};
  }

  if (isRecord(resultJson)) {
    return resultJson;
  }

  if (typeof resultJson !== "string") {
    return {};
  }

  try {
    const parsed: unknown = JSON.parse(resultJson);
    return isRecord(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

export function calculateSeedanceCreditCost(
  resolution: SeedanceCreateTaskInput["resolution"],
  generateAudio: boolean,
): number {
  const baseCost = CREDIT_COST_BY_RESOLUTION[resolution];
  return generateAudio ? Math.ceil(baseCost * 1.5) : baseCost;
}

export function buildSeedanceInput(
  input: SeedanceCreateTaskInput,
): SeedanceKieInput {
  const base: SeedanceKieInput = {
    prompt: input.prompt,
    generate_audio: input.generateAudio,
    resolution: input.resolution,
    aspect_ratio: input.aspectRatio,
    duration: input.duration,
    web_search: input.webSearch ?? false,
    nsfw_checker: input.nsfwChecker ?? true,
  };

  if (input.mode === "image-to-video") {
    return {
      ...base,
      first_frame_url: input.firstFrameUrl,
      ...(input.lastFrameUrl ? { last_frame_url: input.lastFrameUrl } : {}),
    };
  }

  if (input.mode === "multi-reference") {
    return {
      ...base,
      ...((input.referenceImageUrls?.length ?? 0) > 0
        ? { reference_image_urls: input.referenceImageUrls ?? [] }
        : {}),
      ...((input.referenceVideoUrls?.length ?? 0) > 0
        ? { reference_video_urls: input.referenceVideoUrls ?? [] }
        : {}),
      ...((input.referenceAudioUrls?.length ?? 0) > 0
        ? { reference_audio_urls: input.referenceAudioUrls ?? [] }
        : {}),
    };
  }

  return base;
}

export function parseKieSeedanceResult(
  payload: Record<string, unknown>,
): ParsedSeedanceResult {
  const parsed = parseResultJson(payload);

  return {
    resultUrls: stringArray(parsed.resultUrls),
    firstFrameUrls: stringArray(parsed.firstFrameUrl ?? parsed.firstFrameUrls),
    lastFrameUrls: stringArray(parsed.lastFrameUrl ?? parsed.lastFrameUrls),
  };
}
