import type { MediaKind } from "./asset-state";

/** KIE Seedance 2.0 allowed formats (extension-based; MIME varies by browser). */
const ALLOWED_EXTENSIONS: Record<MediaKind, ReadonlySet<string>> = {
  image: new Set(["jpg", "jpeg", "png", "webp", "bmp", "tiff", "tif", "gif"]),
  video: new Set(["mp4", "mov"]),
  audio: new Set(["wav", "mp3"]),
};

const FORMAT_HINT: Record<MediaKind, string> = {
  image: "jpeg, png, webp, bmp, tiff, gif",
  video: "mp4, mov",
  audio: "wav, mp3",
};

export const ASSET_LIMITS = {
  image: {
    maxFiles: 9,
    maxSize: 30 * 1024 * 1024,
    accept:
      "image/jpeg,image/png,image/webp,image/bmp,image/tiff,image/gif,.jpg,.jpeg,.png,.webp,.bmp,.tiff,.tif,.gif",
  },
  video: {
    maxFiles: 3,
    maxSize: 50 * 1024 * 1024,
    accept: "video/mp4,video/quicktime,.mp4,.mov",
  },
  audio: {
    maxFiles: 3,
    maxSize: 15 * 1024 * 1024,
    accept: "audio/wav,audio/mpeg,audio/mp3,.wav,.mp3",
  },
} as const;

export function getFileExtension(fileName: string): string {
  const parts = fileName.split(".");
  if (parts.length < 2) return "";
  return (parts.pop() ?? "").toLowerCase();
}

/**
 * Validate a local file against KIE multi-reference / upload constraints.
 * @returns error message, or null if valid
 */
export function validateMediaFile(file: File, kind: MediaKind): string | null {
  const limit = ASSET_LIMITS[kind];
  if (file.size > limit.maxSize) {
    const maxMb = Math.round(limit.maxSize / (1024 * 1024));
    return `${file.name} is too large (max ${maxMb}MB).`;
  }

  const ext = getFileExtension(file.name);
  if (!ext || !ALLOWED_EXTENSIONS[kind].has(ext)) {
    return `${file.name} has an unsupported format. Use: ${FORMAT_HINT[kind]}.`;
  }

  return null;
}
