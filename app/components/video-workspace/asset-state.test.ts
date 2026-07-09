import { describe, expect, test } from "vitest";
import {
  addPortraitAsset,
  getPendingAssetsForGeneration,
  removeAssetById,
  type UploadedAsset,
} from "./asset-state";

const portrait = {
  id: "p1",
  country: "Japan",
  age: 24,
  gender: "female" as const,
  occupation: "Designer",
  url: "https://cdn.example.com/portrait.webp",
};

describe("video workspace asset state", () => {
  test("does not select a portrait when the image asset limit blocks insertion", () => {
    const existingAssets: UploadedAsset[] = Array.from(
      { length: 9 },
      (_, i) => ({
        id: `image-${i}`,
        name: `Image ${i}`,
        url: `https://cdn.example.com/${i}.webp`,
        kind: "image",
        progress: 100,
        status: "success",
      }),
    );

    const result = addPortraitAsset({
      assets: existingAssets,
      portrait,
      selectedPortrait: null,
      maxImageFiles: 9,
    });

    expect(result.assets).toBe(existingAssets);
    expect(result.selectedPortrait).toBeNull();
    expect(result.error).toBe("You can upload up to 9 image files.");
  });

  test("clears the selected portrait when its asset is removed", () => {
    const portraitAsset: UploadedAsset = {
      id: "portrait:p1",
      name: "Japan 24 Designer",
      url: portrait.url,
      kind: "image",
      progress: 100,
      status: "success",
      previewUrl: portrait.url,
    };

    const result = removeAssetById({
      assets: [portraitAsset],
      id: portraitAsset.id,
      selectedPortrait: portrait,
    });

    expect(result.assets).toEqual([]);
    expect(result.selectedPortrait).toBeNull();
    expect(result.previewUrlToRevoke).toBeUndefined();
  });

  test("does not upload pending assets for text-to-video generation", () => {
    const pendingImage: UploadedAsset = {
      id: "pending-image",
      name: "unused.png",
      url: "",
      kind: "image",
      progress: 0,
      status: "pending",
    };

    expect(
      getPendingAssetsForGeneration({
        assets: [pendingImage],
        activeTab: "text-to-video",
        addEndFrame: false,
      }),
    ).toEqual([]);
  });

  test("uploads only image-to-video pending frames needed by the current frame settings", () => {
    const firstFrame: UploadedAsset = {
      id: "first-frame",
      name: "first.png",
      url: "https://cdn.example.com/first.png",
      kind: "image",
      progress: 100,
      status: "success",
    };
    const unusedPendingImage: UploadedAsset = {
      id: "unused-pending-image",
      name: "unused.png",
      url: "",
      kind: "image",
      progress: 0,
      status: "pending",
    };
    const unusedPendingVideo: UploadedAsset = {
      id: "unused-pending-video",
      name: "unused.mp4",
      url: "",
      kind: "video",
      progress: 0,
      status: "pending",
    };

    expect(
      getPendingAssetsForGeneration({
        assets: [firstFrame, unusedPendingImage, unusedPendingVideo],
        activeTab: "image-to-video",
        addEndFrame: false,
      }),
    ).toEqual([]);
  });

  test("uploads the pending end frame when image-to-video end frame is enabled", () => {
    const firstFrame: UploadedAsset = {
      id: "first-frame",
      name: "first.png",
      url: "https://cdn.example.com/first.png",
      kind: "image",
      progress: 100,
      status: "success",
      frameSlot: "first",
    };
    const endFrame: UploadedAsset = {
      id: "end-frame",
      name: "end.png",
      url: "",
      kind: "image",
      progress: 0,
      status: "pending",
      frameSlot: "last",
    };
    const extraFrame: UploadedAsset = {
      id: "extra-frame",
      name: "extra.png",
      url: "",
      kind: "image",
      progress: 0,
      status: "pending",
    };

    expect(
      getPendingAssetsForGeneration({
        assets: [firstFrame, endFrame, extraFrame],
        activeTab: "image-to-video",
        addEndFrame: true,
      }),
    ).toEqual([endFrame]);
  });
});
