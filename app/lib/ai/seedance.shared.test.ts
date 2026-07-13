import { describe, expect, it } from "vitest";
import {
  buildSeedanceInput,
  calculateSeedanceCreditCost,
  getTaskResultMedia,
  parseKieSeedanceResult,
  seedanceCreateTaskInputSchema,
} from "./seedance.shared";

describe("Seedance shared helpers", () => {
  it("calculates resolution costs and adds 50 percent for generated audio", () => {
    expect(calculateSeedanceCreditCost("480p", false)).toBe(10);
    expect(calculateSeedanceCreditCost("720p", false)).toBe(20);
    expect(calculateSeedanceCreditCost("1080p", false)).toBe(40);
    expect(calculateSeedanceCreditCost("4k", false)).toBe(80);
    expect(calculateSeedanceCreditCost("720p", true)).toBe(30);
    expect(calculateSeedanceCreditCost("4k", true)).toBe(120);
  });

  it("builds text-to-video input without media reference fields", () => {
    expect(
      buildSeedanceInput({
        mode: "text-to-video",
        prompt: "A cinematic city flyover",
        resolution: "1080p",
        aspectRatio: "adaptive",
        duration: 5,
        generateAudio: false,
      }),
    ).toEqual({
      prompt: "A cinematic city flyover",
      generate_audio: false,
      resolution: "1080p",
      aspect_ratio: "adaptive",
      duration: 5,
      web_search: false,
      nsfw_checker: true,
    });
  });

  it("builds image-to-video input with first and optional last frame only", () => {
    expect(
      buildSeedanceInput({
        mode: "image-to-video",
        prompt: "Animate the subject",
        resolution: "720p",
        aspectRatio: "16:9",
        duration: 8,
        generateAudio: true,
        firstFrameUrl: "https://cdn.example.com/first.png",
        lastFrameUrl: "https://cdn.example.com/last.png",
      }),
    ).toMatchObject({
      first_frame_url: "https://cdn.example.com/first.png",
      last_frame_url: "https://cdn.example.com/last.png",
    });
  });

  it("builds multi-reference input without first or last frame fields", () => {
    const input = buildSeedanceInput({
      mode: "multi-reference",
      prompt: "Blend these references",
      resolution: "480p",
      aspectRatio: "9:16",
      duration: 4,
      generateAudio: false,
      referenceImageUrls: ["https://cdn.example.com/a.png"],
      referenceVideoUrls: ["https://cdn.example.com/a.mp4"],
      referenceAudioUrls: ["https://cdn.example.com/a.mp3"],
    });

    expect(input).toMatchObject({
      reference_image_urls: ["https://cdn.example.com/a.png"],
      reference_video_urls: ["https://cdn.example.com/a.mp4"],
      reference_audio_urls: ["https://cdn.example.com/a.mp3"],
    });
    expect(input).not.toHaveProperty("first_frame_url");
    expect(input).not.toHaveProperty("last_frame_url");
  });

  it("rejects multi-reference without image or video references", () => {
    const empty = seedanceCreateTaskInputSchema.safeParse({
      mode: "multi-reference",
      prompt: "Only audio is not enough",
      resolution: "480p",
      aspectRatio: "9:16",
      duration: 5,
      generateAudio: false,
      referenceAudioUrls: ["https://cdn.example.com/a.mp3"],
    });
    expect(empty.success).toBe(false);

    const none = seedanceCreateTaskInputSchema.safeParse({
      mode: "multi-reference",
      prompt: "No media at all",
      resolution: "480p",
      aspectRatio: "9:16",
      duration: 5,
      generateAudio: false,
    });
    expect(none.success).toBe(false);

    const withImage = seedanceCreateTaskInputSchema.safeParse({
      mode: "multi-reference",
      prompt: "Use this image",
      resolution: "480p",
      aspectRatio: "9:16",
      duration: 5,
      generateAudio: false,
      referenceImageUrls: ["https://cdn.example.com/a.png"],
    });
    expect(withImage.success).toBe(true);
  });

  it("parses Seedance result URLs and optional frame URLs", () => {
    expect(
      parseKieSeedanceResult({
        resultJson: JSON.stringify({
          resultUrls: ["https://example.com/video.mp4"],
          firstFrameUrl: "https://example.com/first.webp",
          lastFrameUrl: "https://example.com/last.webp",
        }),
      }),
    ).toEqual({
      resultUrls: ["https://example.com/video.mp4"],
      firstFrameUrls: ["https://example.com/first.webp"],
      lastFrameUrls: ["https://example.com/last.webp"],
    });
  });

  it("reads typed task resultData and legacy string arrays via schema", () => {
    expect(
      getTaskResultMedia({
        videos: [{ key: "kie/results/a/1.mp4", contentType: "video/mp4" }],
        frames: [{ key: "kie/results/a/2.webp", role: "first" }],
        posterKey: "kie/results/a/2.webp",
        persistAttempts: 2,
      }),
    ).toEqual({
      videoKeys: ["kie/results/a/1.mp4"],
      imageKeys: ["kie/results/a/2.webp"],
      posterKey: "kie/results/a/2.webp",
    });

    expect(
      getTaskResultMedia({
        videos: ["legacy/video.mp4"],
        images: ["legacy/frame.webp"],
      }),
    ).toEqual({
      videoKeys: ["legacy/video.mp4"],
      imageKeys: ["legacy/frame.webp"],
      posterKey: "legacy/frame.webp",
    });

    expect(getTaskResultMedia(null)).toEqual({
      videoKeys: [],
      imageKeys: [],
    });
  });
});
