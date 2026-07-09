import type { PortraitItem } from "./portrait-library";
import type { GenerationTab } from "./workspace-types";

export type MediaKind = "image" | "video" | "audio";

export type FrameSlot = "first" | "last";

export interface UploadedAsset {
  id: string;
  name: string;
  url: string;
  kind: MediaKind;
  progress: number;
  status: "pending" | "uploading" | "success" | "error";
  previewUrl?: string;
  error?: string;
  /** Image-to-video dual-frame mode: which frame this image fills. */
  frameSlot?: FrameSlot;
}

export function addPortraitAsset({
  assets,
  portrait,
  selectedPortrait,
  maxImageFiles,
}: {
  assets: UploadedAsset[];
  portrait: PortraitItem;
  selectedPortrait: PortraitItem | null;
  maxImageFiles: number;
}): {
  assets: UploadedAsset[];
  selectedPortrait: PortraitItem | null;
  error?: string;
} {
  if (assets.some((asset) => asset.id === `portrait:${portrait.id}`)) {
    return { assets, selectedPortrait: portrait };
  }

  const imageCount = assets.filter((asset) => asset.kind === "image").length;
  if (imageCount >= maxImageFiles) {
    return {
      assets,
      selectedPortrait,
      error: `You can upload up to ${maxImageFiles} image files.`,
    };
  }

  return {
    assets: [
      ...assets,
      {
        id: `portrait:${portrait.id}`,
        name: `${portrait.country} ${portrait.age} ${portrait.occupation}`,
        url: portrait.url,
        kind: "image",
        progress: 100,
        status: "success",
        previewUrl: portrait.url,
      },
    ],
    selectedPortrait: portrait,
  };
}

export function removeAssetById({
  assets,
  id,
  selectedPortrait,
}: {
  assets: UploadedAsset[];
  id: string;
  selectedPortrait: PortraitItem | null;
}): {
  assets: UploadedAsset[];
  selectedPortrait: PortraitItem | null;
  previewUrlToRevoke?: string;
} {
  const asset = assets.find((item) => item.id === id);
  const removedSelectedPortrait =
    selectedPortrait !== null && id === `portrait:${selectedPortrait.id}`;

  return {
    assets: assets.filter((item) => item.id !== id),
    selectedPortrait: removedSelectedPortrait ? null : selectedPortrait,
    previewUrlToRevoke: asset?.previewUrl?.startsWith("blob:")
      ? asset.previewUrl
      : undefined,
  };
}

export function getImageAssets(assets: UploadedAsset[]) {
  return assets.filter((asset) => asset.kind === "image");
}

export function getFrameAsset(
  assets: UploadedAsset[],
  slot: FrameSlot,
): UploadedAsset | undefined {
  return assets.find(
    (asset) => asset.kind === "image" && asset.frameSlot === slot,
  );
}

export function getI2vFrameUrls(assets: UploadedAsset[], addEndFrame: boolean) {
  if (addEndFrame) {
    const first = getFrameAsset(assets, "first");
    const last = getFrameAsset(assets, "last");
    return {
      firstFrameUrl: first?.status === "success" ? first.url : undefined,
      lastFrameUrl: last?.status === "success" ? last.url : undefined,
    };
  }

  const firstImage = getImageAssets(assets).find(
    (asset) => asset.status === "success",
  );
  return {
    firstFrameUrl: firstImage?.url,
    lastFrameUrl: undefined as string | undefined,
  };
}

export function mapAssetsForEndFrameToggle({
  assets,
  addEndFrame,
}: {
  assets: UploadedAsset[];
  addEndFrame: boolean;
}): UploadedAsset[] {
  const images = getImageAssets(assets);
  const nonImages = assets.filter((asset) => asset.kind !== "image");

  if (addEndFrame) {
    const mapped = images.slice(0, 2).map((image, index) => ({
      ...image,
      frameSlot: (index === 0 ? "first" : "last") as FrameSlot,
    }));
    return [...nonImages, ...mapped];
  }

  return [
    ...nonImages,
    ...images.map(({ frameSlot: _frameSlot, ...image }) => image),
  ];
}

export function replaceFrameAsset({
  assets,
  slot,
  nextAsset,
}: {
  assets: UploadedAsset[];
  slot: FrameSlot;
  nextAsset: UploadedAsset;
}): {
  assets: UploadedAsset[];
  previewUrlToRevoke?: string;
} {
  const existing = getFrameAsset(assets, slot);
  const withoutSlot = assets.filter(
    (asset) => !(asset.kind === "image" && asset.frameSlot === slot),
  );

  return {
    assets: [
      ...withoutSlot,
      {
        ...nextAsset,
        kind: "image",
        frameSlot: slot,
      },
    ],
    previewUrlToRevoke: existing?.previewUrl?.startsWith("blob:")
      ? existing.previewUrl
      : undefined,
  };
}

export function getPendingAssetsForGeneration({
  assets,
  activeTab,
  addEndFrame,
}: {
  assets: UploadedAsset[];
  activeTab: GenerationTab;
  addEndFrame: boolean;
}): UploadedAsset[] {
  if (activeTab === "text-to-video") {
    return [];
  }

  if (activeTab === "image-to-video") {
    if (addEndFrame) {
      return assets.filter(
        (asset) =>
          asset.kind === "image" &&
          (asset.frameSlot === "first" || asset.frameSlot === "last") &&
          asset.status === "pending",
      );
    }

    return getImageAssets(assets)
      .slice(0, 1)
      .filter((asset) => asset.status === "pending");
  }

  return assets.filter(
    (asset) =>
      asset.status === "pending" &&
      (asset.kind === "image" ||
        asset.kind === "video" ||
        asset.kind === "audio"),
  );
}
