import { uploadToR2 } from "~/lib/r2/r2.server";
import { getExtensionFromUrl } from "~/lib/utils";

export type TaskResultMediaType = "image" | "video";

export interface TaskResultMedia {
  type: TaskResultMediaType;
  key: string;
}

export interface TaskResultData {
  images: string[];
  videos: string[];
}

const MEDIA_EXTENSION_BY_MIME: Record<string, string> = {
  "image/avif": "avif",
  "image/bmp": "bmp",
  "image/gif": "gif",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/svg+xml": "svg",
  "image/tiff": "tiff",
  "image/webp": "webp",
  "video/mp4": "mp4",
  "video/mpeg": "mpeg",
  "video/ogg": "ogv",
  "video/quicktime": "mov",
  "video/webm": "webm",
  "video/x-matroska": "mkv",
};

const IMAGE_EXTENSIONS = new Set([
  "avif",
  "bmp",
  "gif",
  "jpeg",
  "jpg",
  "png",
  "svg",
  "tif",
  "tiff",
  "webp",
]);

const VIDEO_EXTENSIONS = new Set([
  "3g2",
  "3gp",
  "avi",
  "f4v",
  "flv",
  "mkv",
  "mov",
  "mp4",
  "mpeg",
  "mpg",
  "ogv",
  "ts",
  "webm",
]);

function normalizeContentType(contentType: string | null): string | null {
  return contentType?.split(";").at(0)?.trim().toLowerCase() ?? null;
}

function inferMediaType(
  url: string,
  contentType: string | null,
): TaskResultMediaType {
  if (contentType?.startsWith("video/")) {
    return "video";
  }

  if (contentType?.startsWith("image/")) {
    return "image";
  }

  const extension = getExtensionFromUrl(url);
  if (extension && VIDEO_EXTENSIONS.has(extension)) {
    return "video";
  }

  if (extension && IMAGE_EXTENSIONS.has(extension)) {
    return "image";
  }

  return "image";
}

function inferExtension(
  url: string,
  contentType: string | null,
  mediaType: TaskResultMediaType,
): string {
  const extensionFromMime = contentType
    ? MEDIA_EXTENSION_BY_MIME[contentType]
    : null;

  if (extensionFromMime) {
    return extensionFromMime;
  }

  const extensionFromUrl = getExtensionFromUrl(url);
  if (extensionFromUrl) {
    return extensionFromUrl;
  }

  return mediaType === "video" ? "mp4" : "png";
}

export async function uploadTaskResultUrlsToR2(
  resultUrls: string[],
  taskId: string,
): Promise<TaskResultMedia[]> {
  const media: TaskResultMedia[] = [];

  for (let i = 0; i < resultUrls.length; i++) {
    const url = resultUrls[i];
    if (!url) {
      continue;
    }

    const response = await fetch(url);
    if (response.status !== 200) {
      console.error("fetch task result error, url:", url);
      console.error(
        "fetch task result error, status:",
        response.status,
        response.statusText,
      );
      continue;
    }

    const contentType = normalizeContentType(
      response.headers.get("Content-Type"),
    );
    const mediaType = inferMediaType(url, contentType);
    const extension = inferExtension(url, contentType, mediaType);
    const key = `tasks/${taskId}-${i}.${extension}`;
    const body = await response.arrayBuffer();
    const uploaded = await uploadToR2(body, key, contentType);

    if (uploaded) {
      media.push({
        type: mediaType,
        key,
      });
    }
  }

  return media;
}

export function buildTaskResultData(media: TaskResultMedia[]): TaskResultData {
  return media.reduce<TaskResultData>(
    (result, item) => {
      if (item.type === "video") {
        result.videos.push(item.key);
      } else {
        result.images.push(item.key);
      }

      return result;
    },
    { images: [], videos: [] },
  );
}
