import { Download, Expand, ImageIcon, Play, X } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogOverlay, DialogPortal } from "~/components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "~/components/ui/pagination";
import { getUserCompletedTasksPaginated } from "~/lib/model/userTask";
import { useR2Domain } from "~/lib/public-env";
import { buildR2Url } from "~/lib/r2/r2.shared";
import { cn } from "~/lib/utils";
import { requireUser } from "~/middlewares/auth-guard";
import type { Route } from "./+types/creations";

const PAGE_SIZE = 12;

type GalleryResultData = { images: string[]; videos: string[] };

type GalleryItem = {
  taskId: string;
  mediaKey: string;
  mediaType: "image" | "video";
  template: string;
  createdAt: Date;
};

function getMediaTypeLabel(mediaType: GalleryItem["mediaType"]) {
  switch (mediaType) {
    case "video":
      return "Video";
    default:
      return "Image";
  }
}

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { user } = requireUser();

  const url = new URL(request.url);
  const page = Math.max(1, Number(url.searchParams.get("page")) || 1);

  const tasks = await getUserCompletedTasksPaginated(user.id, page, PAGE_SIZE);

  const mediaItems: GalleryItem[] = [];
  for (const task of tasks.items) {
    const resultData = task.resultData as GalleryResultData;
    const imageKeys = resultData?.images ?? [];

    if (resultData?.videos) {
      for (const videoKey of resultData.videos) {
        mediaItems.push({
          taskId: task.id,
          mediaKey: videoKey,
          mediaType: "video",
          template: task.template,
          createdAt: task.createdAt,
        });
      }
    }

    for (const imageKey of imageKeys) {
      mediaItems.push({
        taskId: task.id,
        mediaKey: imageKey,
        mediaType: "image" as const,
        template: task.template,
        createdAt: task.createdAt,
      });
    }
  }

  return {
    mediaItems,
    currentPage: page,
    totalPages: tasks.totalPages,
    total: tasks.total,
  };
};

export default function CreationsPage({ loaderData }: Route.ComponentProps) {
  const { t } = useTranslation();
  const { mediaItems, currentPage, totalPages } = loaderData;
  const [selectedMedia, setSelectedMedia] = useState<GalleryItem | null>(null);
  const r2Domain = useR2Domain();

  const handleDownload = async (mediaKey: string) => {
    const mediaUrl = buildR2Url(mediaKey, r2Domain);
    const a = document.createElement("a");
    a.href = mediaUrl;
    a.download = mediaKey.split("/").pop() || "result";
    a.rel = "noopener noreferrer";
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/20" />
      <div className="absolute top-0 right-0 h-[800px] w-[800px] rounded-full bg-gradient-radial from-indigo-200/20 via-transparent to-transparent blur-3xl" />
      <div className="absolute bottom-0 left-0 h-[600px] w-[600px] rounded-full bg-gradient-radial from-purple-200/20 via-transparent to-transparent blur-3xl" />

      <div className="relative pt-32 pb-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-12 text-center">
            <h1
              className="mb-4 font-bold text-4xl text-slate-900 tracking-tight opacity-0 md:text-5xl"
              style={{ animation: "fade-in-up 0.6s ease-out 0.1s forwards" }}
            >
              {t("creations.title")}
            </h1>
            <p
              className="text-lg text-slate-600 opacity-0"
              style={{ animation: "fade-in-up 0.6s ease-out 0.2s forwards" }}
            >
              {t("creations.description")}
            </p>
          </div>

          {/* Gallery Grid or Empty State */}
          {mediaItems.length === 0 ? (
            <div
              className="py-24 text-center opacity-0"
              style={{ animation: "fade-in-up 0.6s ease-out 0.3s forwards" }}
            >
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
                <ImageIcon className="h-10 w-10 text-slate-400" />
              </div>
              <h3 className="mb-2 font-semibold text-slate-900 text-xl">
                {t("creations.emptyTitle")}
              </h3>
              <p className="text-slate-500">
                {t("creations.emptyDescription")}
              </p>
            </div>
          ) : (
            <div
              className="opacity-0"
              style={{ animation: "fade-in-up 0.6s ease-out 0.3s forwards" }}
            >
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {mediaItems.map((item, index) => (
                  <div
                    className="group relative aspect-square overflow-hidden rounded-xl bg-slate-100"
                    key={`${item.taskId}-${item.mediaKey}`}
                    style={{
                      animationDelay: `${0.3 + index * 0.05}s`,
                    }}
                  >
                    {item.mediaType === "video" ? (
                      <>
                        <video
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          muted
                          playsInline
                          preload="metadata"
                          src={buildR2Url(item.mediaKey, r2Domain)}
                        />
                        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                          <div className="rounded-full bg-black/55 p-3 text-white shadow-lg">
                            <Play className="h-6 w-6 fill-current" />
                          </div>
                        </div>
                      </>
                    ) : (
                      <img
                        alt="Generated result"
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                        src={buildR2Url(item.mediaKey, r2Domain)}
                      />
                    )}

                    <span className="absolute top-3 right-3 rounded-md bg-black/70 px-2.5 py-1 font-medium text-white text-xs shadow-sm backdrop-blur-sm">
                      {item.template || getMediaTypeLabel(item.mediaType)}
                    </span>

                    <button
                      aria-label={`View ${getMediaTypeLabel(item.mediaType).toLowerCase()}`}
                      className="absolute inset-0 z-10 cursor-pointer outline-none ring-indigo-500/60 ring-inset transition-shadow focus-visible:ring-2"
                      onClick={() => setSelectedMedia(item)}
                      type="button"
                    />

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 z-20 flex items-center justify-center gap-3 bg-black/40 opacity-0 transition-opacity duration-200 group-focus-within:opacity-100 group-hover:opacity-100">
                      <button
                        aria-label={
                          item.mediaType === "video"
                            ? t("creations.viewVideo")
                            : t("creations.viewFullSize")
                        }
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-lg transition-transform hover:scale-110"
                        onClick={() => setSelectedMedia(item)}
                        type="button"
                      >
                        <Expand className="h-5 w-5" />
                      </button>
                      <button
                        aria-label={
                          item.mediaType === "video"
                            ? t("creations.downloadVideo")
                            : t("creations.downloadImage")
                        }
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-lg transition-transform hover:scale-110"
                        onClick={() => handleDownload(item.mediaKey)}
                        type="button"
                      >
                        <Download className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-12">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          className={cn(
                            currentPage <= 1 &&
                              "pointer-events-none opacity-50",
                          )}
                          href={
                            currentPage > 1
                              ? `?page=${currentPage - 1}`
                              : undefined
                          }
                        />
                      </PaginationItem>

                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter((page) => {
                          return (
                            page === 1 ||
                            page === totalPages ||
                            Math.abs(page - currentPage) <= 1
                          );
                        })
                        .map((page, idx, arr) => {
                          const prevPage = arr[idx - 1];
                          const showEllipsis = prevPage && page - prevPage > 1;

                          return (
                            <PaginationItem key={page}>
                              {showEllipsis && (
                                <span className="px-2 text-slate-400">...</span>
                              )}
                              <PaginationLink
                                href={`?page=${page}`}
                                isActive={page === currentPage}
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        })}

                      <PaginationItem>
                        <PaginationNext
                          className={cn(
                            currentPage >= totalPages &&
                              "pointer-events-none opacity-50",
                          )}
                          href={
                            currentPage < totalPages
                              ? `?page=${currentPage + 1}`
                              : undefined
                          }
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Preview Dialog */}
      <Dialog
        onOpenChange={(open) => !open && setSelectedMedia(null)}
        open={selectedMedia !== null}
      >
        <DialogPortal>
          <DialogOverlay className="bg-black/80" />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="relative max-h-[90vh] max-w-[90vw]">
              {/* Close Button */}
              <button
                aria-label="Close"
                className="-top-12 absolute right-0 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
                onClick={() => setSelectedMedia(null)}
                type="button"
              >
                <X className="h-5 w-5" />
              </button>

              {selectedMedia?.mediaType === "video" ? (
                <video
                  autoPlay
                  className="max-h-[80vh] max-w-full rounded-lg object-contain shadow-2xl"
                  controls
                  playsInline
                  src={buildR2Url(selectedMedia.mediaKey, r2Domain)}
                >
                  <track kind="captions" label="Captions unavailable" />
                </video>
              ) : (
                selectedMedia && (
                  <img
                    alt="Full size view"
                    className="max-h-[80vh] max-w-full rounded-lg object-contain shadow-2xl"
                    src={buildR2Url(selectedMedia.mediaKey, r2Domain)}
                  />
                )
              )}

              {/* Download Button */}
              {selectedMedia && (
                <div className="mt-4 flex justify-center">
                  <button
                    className="flex items-center gap-2 rounded-full bg-white px-6 py-3 font-medium text-slate-900 shadow-lg transition-transform hover:scale-105"
                    onClick={() => handleDownload(selectedMedia.mediaKey)}
                    type="button"
                  >
                    <Download className="h-5 w-5" />
                    Download
                  </button>
                </div>
              )}
            </div>
          </div>
        </DialogPortal>
      </Dialog>
    </div>
  );
}
