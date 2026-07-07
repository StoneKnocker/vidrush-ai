import type { PortraitItem } from "./portrait-library";

export type MediaKind = "image" | "video" | "audio";

export interface UploadedAsset {
  id: string;
  name: string;
  url: string;
  kind: MediaKind;
  progress: number;
  status: "uploading" | "success" | "error";
  previewUrl?: string;
  error?: string;
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
