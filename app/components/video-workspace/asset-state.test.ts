import { describe, expect, test } from "vitest";
import {
  addPortraitAsset,
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
});
